---
title: Spark MLlib I
published: true
description: |
    The marriage of Big Data and Machine Learning
    is a blessing for all. However, how can we make
    our algorithms run correctly in a parallelized fashion?
    Are all techniques fit for this change in their internals?
    Thanks to Spark MLlib we can just use APIs we are
    already familiar with while taking advantage of parallel
    and distributed computing.
category: Spark
ctime: 2018-03-27
---

Spark MLlib offers functions helping us implement Machine Learning algorithms. However, these algorithms require to have a solution or aproximation when being applied in parallel in a cluster, i.e they need to support horizontal scaling. A fine example of that would be Distributed Random Forests. We will use versions greater than 2.0, from which the API started to be based on Datasets/Dataframes and not just RDDs. The main difference here is that, while both RDDs and Datasets/Dataframes are immutable distributed collection of elements of your data, Datasets/Dataframes have data organized in a tabular schema with structure defined when created (names and types).

And what about Dataframes and Datasets?

In Python API we don't have such a problem, as one can only work with DataFrames, where a DF is just a Dataset and each row is accessed by the generic type **Row**. Same definition applies to Java, though there exists a separated Dataset object, where one needs to define a row container:

```java
Dataset<Row> myDataFrame = spark.read().json("people.json")

Encoder<Person> pEncoder = Encoders.bean(Person.class);
Dataset<Person> myDataSet = spark.read().json(("people.json")).as(pEncoder);
```

The goal of this post will be building a low level algorithm using MLlib functions to detect whether mail is spam or not, using some basic text analysis techniques. Mails are stored in a directory in raw format. Labels will be taken from a separate file indicating spam with (label=0) or not spam (label=1).

## Read files

We will start by reading the labels file and storing it in a HashMap:

```java
public static HashMap<String, Integer> loadSampleLabels(String filePath) throws IOException
	{
		HashMap<String, Integer> map = new HashMap<String, Integer>();

		BufferedReader br = new BufferedReader(new FileReader(filePath));
		try {
			
		    String line;
		    while ((line = br.readLine()) != null) {
		    	String[] parts = line.split(",");
		    	map.put(parts[0], Integer.parseInt(parts[1]));
		    }
		    
		} catch (IOException e) {
			e.printStackTrace();
			
		} finally {
		    br.close();
		}
		
		return(map);
	}
```

```java
HashMap<String, Integer> labels = loadSampleLabels("src/main/resources/1_spam-mail.tr.label");
```

Then, as we have all mails stored in a directory, read all its contents through spark function *wholeTextFiles*.

```java
public static Dataset<Row> readMailFiles(SparkSession ss, JavaSparkContext jsc, String path)
	{
		// Convert JavaPairRDD to DataFrame --> we need to define our schema.
		StructType schema = new StructType(new StructField[] {
			createStructField("fileName", StringType, true),
			createStructField("text", StringType, true)
		});
		
		JavaPairRDD<String, String> allEmails = jsc.wholeTextFiles(path);
		JavaRDD<Row> emailsRDD = allEmails.map(tuple -> RowFactory.create(tuple._1(), tuple._2()));
		Dataset<Row> emailsDataset = ss.createDataFrame(emailsRDD, schema);
		return(emailsDataset);
	}
```

```java
// obtain the spark context
JavaSparkContext jsc = new JavaSparkContext(ss.sparkContext());

// use broadcast to send efficiently the HashMap to the workers
final Broadcast<HashMap<String, Integer>> bc = jsc.broadcast(labels);

// store in a dataset all train files
Dataset<Row> eMails = readMailFiles(ss,jsc,"src/main/resources/1_TR");
```

Now, define a User Defined Function (UDF) to link the label in the HashMap with the train files. They are named *TRAIN_ID*. 
```java
ss.udf().register("getLabel", new UDF1<String, Float>() {
	      public  Float call(final String fileName) {
	    	    Pattern pattern = Pattern.compile(".*TRAIN_([0-9]*).*");
				Matcher mClass = pattern.matcher(fileName);
				float label = 0;
				if (mClass.find())
	            {
	            	String mailID = mClass.group(1);
	            	label = bc.value().get(mailID);
	            }
	        return (label);
	      }
	    }, FloatType);	 	


// Add the label column to the DataFrame
Dataset<Row> labeledMails = eMails.withColumn("label", callUDF("getLabel", eMails.col("fileName")));
```

## Transform data

We will apply a HashingTF to the train files text in order to obtain numerical features to which we can apply a Machine Learning model. 

First, we need to use a tokenizer to transform whole text to an array of words. In there, one can apply stemming and is a common practice to remove stop words, i.e words without semantical meaning like *a, the* or  *my*. There are closed lists online with all these words in different languages.

```java
public static Dataset<Row> transformTFIDF (Dataset<Row> ds, int numFeatures)
	{
		Tokenizer tokenizer = new Tokenizer().setInputCol("text").setOutputCol("words");
		Dataset<Row> wordsData = tokenizer.transform(ds);
		
		HashingTF hashingTF = new HashingTF()
			      .setInputCol("words")
			      .setOutputCol("features")
			      .setNumFeatures(numFeatures);
		
		Dataset<Row> featurizedData = hashingTF.transform(wordsData);
		
	    return(featurizedData);
```

```java
Dataset<Row> featurizedData = transformTFIDF(labeledMails, 1000);
```

## Train model

We will use SVM with a linear kernel. One can input directly a grid of parameters to perform a GridSearch with Cross-Validation and end up with the best model under some metric. In our case, the parameter we are searching is the regularization parameter under accuracy metric. 

OBS: We use *MulticlassClassificationEvaluator()* because the binary evaluator does not have the accuracy.

```java
public static CrossValidatorModel fitModel(Dataset<Row> train)
	{
	  
	  LinearSVC lsvc = new LinearSVC()
	          .setMaxIter(5)
	          .setLabelCol("label")
	          .setFeaturesCol("features");
	    
	  ParamMap[] paramGrid = new ParamGridBuilder()
			  .addGrid(lsvc.regParam(), new double[] {10.0, 1.0, 0.1})
			  .build();
	  
	  CrossValidator cv = new CrossValidator()
			  .setEstimator(lsvc)
			  .setEvaluator(new MulticlassClassificationEvaluator()
					  .setMetricName("accuracy")
					  .setLabelCol("label")
					  .setPredictionCol("prediction"))
			  .setEstimatorParamMaps(paramGrid).setNumFolds(5);
	  
      CrossValidatorModel cvModel = cv.fit(train);
      return(cvModel);
	}
```

## Apply model

Split data in train/test under a given percentage, fit the model and print results.

```java
double[] percentage = {0.75, 0.25};
	    
Dataset<Row>[] traintest = featurizedData.randomSplit(percentage);

Dataset<Row> train = traintest[0];
Dataset<Row> test = traintest[1];	      

// Ensure permanence of train dataset in workers memory
train.persist();

// Fit model
CrossValidatorModel cvModel = fitModel(train);

// Predict
Dataset<Row> predictions = cvModel.transform(test).select("prediction","label");

// Define an evaluator
MulticlassClassificationEvaluator evaluator = new MulticlassClassificationEvaluator()
	        .setMetricName("accuracy")
	        .setLabelCol("label")
	        .setPredictionCol("prediction");


double accuracy = evaluator.evaluate(predictions);
System.out.println("Train samples: "+train.count());
System.out.println("Test samples: "+test.count());
System.out.println("Test Error = " + (1 - accuracy));

ss.stop(); 
```
