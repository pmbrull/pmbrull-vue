---
title: Text Analysis on Movie Data - LDA
published: true
description: |
    Analyzing texts is one of the most useful tasks
    one can apply in machine learning, because the whole
    internet is a dataset. How can we group films based
    solely on their description? How we can make sense
    of the different terms? Let's get hands-on!
category: Machine Learning
ctime: 2018-09-09
---

In this post, we are going to explore the **IMDB Movie Dataset** and try to apply topic modeling using Latent Dirichlet Allocation ([LDA](https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation)).

# Small exploration of the dataset

We will start by plotting some values of our dataset. As we are interested in the **genre** and **description** columns, that's where we will focus on:

```python
import pandas as pd

df = pd.read_csv("IMDB-Movie-Data.csv")
print('Dataset has {} rows and {} columns.'.format(df.shape[0], df.shape[1]))
df.head()
```

    Dataset has 1000 rows and 12 columns.

| Rank | Title                   | Genre                    | Description                         | Director             | ...  | Metascore |
| ---- | ----------------------- | ------------------------ | ----------------------------------- | -------------------- | ---- | --------- |
| 1    | Guardians of the Galaxy | Action,Adventure,Sci-Fi  | A group of intergalactic...         | James Gunn           |      | 76.0      |
| 2    | Prometheus              | Adventure,Mystery,Sci-Fi | Following clues to the origin of... | Ridley Scott         |      | 65.0      |
| 3    | Split                   | Horror,Thriller          | Three girls are kidnapped...        | M. Night Shyamalan   |      | 62.0      |
| 4    | Sing                    | Animation,Comedy,Family  | In a city of humanoid...            | Christophe Lourdelet |      | 59.0      |
| 5    | Suicide Squad           | Action,Adventure,Fantasy | A secret government agency...       | David Ayer           |      | 40.0      |

## Genre

To begin with, how many genres are there? One movie can belong to more than genre, each of them separated by commas.


```python
split = [elem.split(',') for elem in df['Genre'].unique()]
genres = list(set([i for sub in split for i in sub]))
print(genres)
print('\nThere are {} different movie genres.'.format(len(genres)))
```

    ['Music', 'Biography', 'Sci-Fi', 'Action', 'Horror', 'Mystery', 'Family', 'Drama', 'War', 'Comedy', 'History', 'Musical', 'Adventure', 'Thriller', 'Animation', 'Western', 'Fantasy', 'Crime', 'Sport', 'Romance']
    
    There are 20 different movie genres.

Let's adapt **plotly** configurations and visualize the distribution of number of films by genre:

```python
from plotly.offline import init_notebook_mode, iplot
import plotly.graph_objs as go

_PLOTLY_CONFIG = {"displaylogo": False,
                "modeBarButtonsToRemove": ["sendDataToCloud", "select2d", "lasso2d", "resetScale2d"]}

init_notebook_mode()
```

```python
values = []
for genre in genres:
    values.append(df.loc[df['Genre'].str.contains(genre)].shape[0])

data = [go.Bar(x=genres, y=values)]

layout = go.Layout(
    title='Films by genre',
    xaxis=dict(tickangle=45)
)

fig = go.Figure(data=data, layout=layout)
iplot(fig, show_link=False, config=_PLOTLY_CONFIG)
```

<img src="../../images/posts/ml/lda/films-by-genre.png" class="w-84 my-4 justify-center m-auto">

From the 20 genres, only a few have a board representation in the data. When performing LDA, a reasonable number of topics to search could be 6 or 7, having in mind that genres with close to no representation are likely from films with more generic tags like *Drama* or *Comedy*.

## Description

We do not have at our disposal a dataset big enough, so when extracting information about the text in this first part we will use *word stemming*, stop words, punctuation and anagrams removal. Also, if any word contains a number, disregard it (i.e. *12-mile*). Abbreviations are not taken into account either: *can't* becomes *can*, *I'll* becomes *I*. If we had enough words, we could keep them as they are so that our model could learn from all types of semantic information. However, we need to use this aggressive tokenization and thus, end up being more generic.

```python
from nltk.corpus import stopwords
stop_words = stopwords.words('english')

from nltk.stem import SnowballStemmer
from nltk.tokenize import word_tokenize

snow = SnowballStemmer('english')
stop_words.extend(["\'s", "\'ll", 
                   "\'d", "\'n", "a.k.a", "a.t.f"])
punctuation = ['.', ',', '"', "'", ':', ';', '(', ')',
               '[', ']', '{', '}','?',"''", "-", "...",
               "»", "``", "--", "!", "#", "$"]


def hasNumbers(inputString):
    return any(char.isdigit() for char in inputString)

def tokenizer_stem(sentence):
    """
    Tokenizes a sentence, lowers words, and
    removes stop_words and punctuation.
    Applies a stemmer.
    """
    v = word_tokenize(sentence)
    filtered = [snow.stem(word.lower()) for word in v 
                if word.lower() not in stop_words
                and word not in punctuation
                and not hasNumbers(word)]
```

An example of film review:


```python
df['Description'][0]
```


    'A group of intergalactic criminals are forced to work together to stop a fanatical warrior from taking control of the universe.'

Which after applying our tokenizer, ends up in:


```python
df['dataset'] = df['Description'].map(lambda x: tokenizer_stem(x))
print(df['dataset'][0])
```

    ['group', 'intergalact', 'crimin', 'forc', 'work', 'togeth', 'stop', 'fanat', 'warrior', 'take', 'control', 'univers']

What just happened here is that we are breaking our sentence in a list of words. From those words:

1. Put all words to lowercase, as we will treat the same *"Universe"* and *"universe"*.
2. Remove stop_words (i.e words without real semantic meaning, such as *"a"* or *"the"*).
3. Remove punctuation and words containing numbers.
4. Apply word stemming, returning the **root** form of the word, which is holding the most part of the meaning. 

Now, let's get an idea of the word distribution among all topics: Compute a word count and check whether they appear in a lot of topics or are somehow exclusive.


```python
def addWords(v, myset):
    """
	adds the elements of a vector
	to a set.
	"""
    for elem in v:
        myset.add(elem)

allWords = set()

_ = df['dataset'].map(lambda x: addWords(x, allWords))

print('There are {} words after tokenization in our dataset.'.format(len(allWords)))
```

    There are 4595 words after tokenization in our dataset.

Prepare a dataframe with the counting of alls words in each topic:


```python
df_counting = pd.DataFrame(columns=['words'] + genres)
df_counting['words'] = list(allWords)

# Start countings at 0
df_counting = df_counting.fillna(0)

def fill_words_df(df, df_count):
    """
    For each movie and each of its genres,
    add a counting for all words in
    description.
    """
    for i, row in df.iterrows():
        for genre in row['Genre'].split(','):
            for w in row['dataset']:
                df_count.loc[df_count['words'] == w, genre] =  1\
                + df_count.loc[df_count['words'] == w, genre]
                
# Fill DataFrame
fill_words_df(df, df_counting)
```


```python
df_counting.head()
```
|      | words     | Drama | Thriller | War  | Animation | ... | Crime | Music |
| ---- | --------- | ----- | -------- | ---- | --------- | ----| ----- | ----- |
| 0    | complic   | 3     | 3        | 0    | 0         | ... | 1     | 0     |
| 1    | programm  | 1     | 0        | 0    | 0         | ... | 0     | 0     |
| 2    | mastiff   | 0     | 0        | 0    | 1         | ... | 0     | 0     |
| 3    | tell      | 5     | 0        | 0    | 0         | ... | 0     | 0     |
| 4    | coachella | 0     | 0        | 0    | 0         | ... | 0     | 0     |

With words that appear almost in every film genre, topic information we can extract from it can be almost none. The more specific a word is, the better, as it could be used to easily distinguish among topics.

We can prepare a generic function that plots how a given word is distributed among genres:

```python
def plot_word_by_genre(word, df_count, genres):
    """
    Plot word by genre distribution given
    the df of countings
    """
    y = df_count.loc[df_count['words'] == word, genres].values[0]
    data = [go.Bar(x=genres, y=y)]
    layout = go.Layout(title='Word {} counting by genre'.format(word),
                       xaxis=dict(tickangle=45))
    iplot(go.Figure(data=data, layout=layout),
          show_link=False,
          config=_PLOTLY_CONFIG)
```

Using a highly insipid word such as *"boy"*, we can see that it appears in almost all genres:

```python
plot_word_by_genre('boy', df_counting, genres)
```

<img src="../../images/posts/ml/lda/word-boy-counting-by-genre.png" class="h-96 my-4 justify-center m-auto">


However, going a bit more specific with words like *"shelter"* or *"intergalact"*

<img src="../../images/posts/ml/lda/word-shelter-counting-by-genre.png" class="h-96 my-4 justify-center m-auto">


<img src="../../images/posts/ml/lda/word-intergalact-counting-by-genre.png" class="h-96 my-4 justify-center m-auto">


Another interesting thing to check here is whether there are any words belonging to just one genre. Prepare some ingredients first...

```python
def appearences(df, num_app, genres):
    """
    Get the words and the length of the words'
    list that have apprearences in "num_app"
    different genres.
    """
    wordsAppear = []
    for i, row in df.iterrows():
        g = row[genres].values.tolist()
        appear = len(genres) - g.count(0)
        if appear == num_app:
            wordsAppear.append(row['words'])
    return wordsAppear, len(wordsAppear)
```

And check:

```python
num_app = 1
wordsAppear, leng = appearences(df_counting, num_app, genres)
print('The number of words that appear in {} genres is {}.'.format(num_app, leng))

```

    The number of words that appear in 1 genres is 271.

What about 10 genres?


```python
# Look for words that appear in X genres
num_app = 10
wordsAppear, leng = appearences(df_counting, num_app, genres)
print('The number of words that appear in {} genres is {}.'.format(num_app, leng))
```

    The number of words that appear in 10 genres is 92.

If we now print the word count by genre distribution: 

```python
def plot_appearences(df_count, genres):
    
    countings = []
    for n in list(range(1,len(genres)+1)):
        wordsAppear, leng = appearences(df_count, n, genres)
        countings.append(leng)

    trace = go.Scatter(
        x = list(range(1,len(genres)+1)),
        y = countings,
        mode = 'lines+markers',
        name = 'lines+markers'
    )

    layout = go.Layout(title='Word counting by number of genres',
                       xaxis=dict(tickangle=45))
    iplot(go.Figure(data=[trace], layout=layout),
          show_link=False,
          config=_PLOTLY_CONFIG)
```
```python
plot_appearences(df_count, genres)
```

<img src="../../images/posts/ml/lda/word-counting-by-number-of-genres.png" class="h-96 my-4 justify-center m-auto">


We can observe that most of the words appear in 3 different genres. Also, we have a not that bad number of really specific words belonging to 2 or less genres. Then, there is a long tail of mostly generic data. 

# Latent Dirichlet Allocation

This approach to topic modeling considers each document as a collection of topics with a certain probability, where each topic is seen as a collection of words, again, with a certain distribution.

We start by preparing a dictionary with all our dataset words, excluding those with presence in too much genres, such as boy, man, woman, young... They hold close to no real meaning and could be considered stop words in this analysis. We will remove those words belonging to 15 or more genres. 

> OBS: As we do not have that much data, we need to play a conservative role here, although I'd like to remove even more words. 

```python
generic_words = []
for i in list(range(15, len(genres)+1)):
    v, _ = appearences(df_counting, i, genres)
    generic_words.extend(v)
```


```python
def remove_generic_words(v, generic_words):
    return [word for word in v if word not in generic_words]

df['dataset'] = df['dataset'].map(lambda x: remove_generic_words(x, generic_words))

allWords = set()       
_ = df['dataset'].map(lambda x: addWords(x, allWords))

print('There are {} words after generic word removal in our dataset.'.format(len(allWords)))
```

    There are 4517 words after generic word removal in our dataset.

For LDA, we will use **gensim** module:

```python
dictionary = corpora.Dictionary(df['dataset'])
corpus = [dictionary.doc2bow(text) for text in df['dataset']]
corpora.MmCorpus.serialize('/tmp/movies.mm', corpus)
```

Gensim creates a unique id for each word in the document. Thus, the corpus is just a mapping between {word id occurrence, frequency} for the different documents. Try how LDA performs with 7 topics:


```python
lda = LdaModel(corpus=corpus, 
               id2word=dictionary
               num_topics=7
               iterations=500
               alpha='auto')
```

Exploring a little the main words in each topic, we will print the top 6 words for each one of the 7 generated topics:


```python
pd.DataFrame([[word for word, _ in lda.show_topic(topicno, topn=6)]\
              for topicno in range(lda.num_topics)]).transpose()
```

|      | 0      | 1      | 2     | 3        | 4      | 5        | 6       |
| ---- | ------ | ------ | ----- | -------- | ------ | -------- | ------- |
| 0    | forc   | woman  | woman | woman    | woman  | kill     | save    |
| 1    | coupl  | hunt   | see   | forc     | past   | save     | forc    |
| 2    | vampir | secret | dark  | murder   | togeth | protect  | agent   |
| 3    | soon   | togeth | parti | adventur | dead   | vampir   | human   |
| 4    | face   | kill   | full  | return   | secret | assassin | student |
| 5    | power  | come   | land  | wife     | forc   | plan     | race    |

Check the percentage of presence of the first film in each topic:

```python
lda.get_document_topics(corpus[0])
```


    [(1, 0.010407086),
     (2, 0.010258413),
     (3, 0.010539351),
     (4, 0.9385561),
     (5, 0.01012295),
     (6, 0.010224721)]
Observe how *Guardians of the Galaxy* is most represented by topic number 4, while topic number 0 is not even showed due to not being higher that the minimum relevance threshold.


```python
print(df['Description'][0])
print('\nGenres: ', df['Genre'][0])
```

    A group of intergalactic criminals are forced to work together to stop a fanatical warrior from taking control of the universe.
    
    Genres:  Action,Adventure,Sci-Fi


Visualizing the distribution of the topics:

```python
topics = list(range(lda.num_topics))
df['topics'] = lda.get_document_topics(corpus)
df['topic_num'] = df['topics'].map(lambda x: max(x,key=itemgetter(1))[0])

iplot([go.Bar(x=topics, y=df.groupby(['topic_num'])['Title'].count().values)],
      show_link=False, config=_PLOTLY_CONFIG)
```

<img src="../../images/posts/ml/lda/topic-distribution.png" class="h964 my-4 justify-center m-auto">


Topic distribution is fairly uniform, which is a good sign, meaning we are not choosing a number of topics too large. However, in our case was somehow easy as we already knew the real topic distribution.

To further asses the quality of the LDA results, let's visualize the distribution of topics regarding their keywords in a space where Partial Component Analysis was computed on top of them and just the two principle components where extracted. Each bubble represents a topic. As we say with the previous figure, bubbles have similar size, meaning that its topic marginal distribution is uniform across the corpus. Also, they do not overlap, so their topic represents different information.


```python
import pyLDAvis
import pyLDAvis.gensim 

pyLDAvis.enable_notebook()
vis = pyLDAvis.gensim.prepare(lda, corpus, dictionary)
vis
```

<img src="../../images/posts/ml/lda/intertopic-distance-map.png" class="h-96 my-4 justify-center m-auto">

And this is it, we exposed some techniques for exploring, processing and analyzing text data. In the next post, we'll try to apply a classification model to predict movie genre. As always, I hope it helped someone :)
