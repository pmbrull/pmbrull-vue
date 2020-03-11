---
title: ElasticSearch as DB of choice
published: true
description: |
    In which cases would we need to use ElasticSearch?
    Let's have a brief look into the world of Document
    Stores and Text Search! 
category: Big Data
ctime: 2018-08-04
---

## Introduction

As MongoDB, **ElasticSearch** is a **Document-Store**, which can be seen essentially as a key-value store where the value  shows a greater structure level. We can benefit from them as the record atomicity changes. One does not refer anymore to rows, a set of pre-defined information given as columns, but to **documents**, where information has no closed schema and can be nested to show different hierarchic levels.

This means that the further the schema can go is document-wise, where information can be accessed by the implicit structure of the type format, as tags from XML or JSON. For example:

```
{
    "product": "Yogur Natural con Proteínas",
    "Calcio": "123.00",
    "Sal": "0.07",
    "Ácidos Grasos Saturados": "0.10",
    "ingredients": [
        "Queso fresco desnatado (50%)", ["leche desnatada pasteurizada", "cuajo y fermentos lácticos"], "leche desnatada pasteurizada", "leche desnatada en polvo", "proteínas de la leche", "espesante (goma guar)", "nata pasteurizada y fermentos lácticos"]
}
```

This is an extract of data about a yogurt. We can access all the information from the document by the different keys (*product*, *ingredients...*), and we can see how some values can be even arrays of data. With data like this, a Document-Store is an excellent choice, as we can then ingest all product information as-it-is, without worrying about different products containing different fields or different structure for the same field (as *ingredients* may not always be an array).

## MongoDB vs. ElasticSearch

The main difference between MongoDB and ElasticSearch is how data is accessed and retrieved. While MongoDB uses usual indexing to access the disk and obtain the documents, ElasticSearch is built on top of **Apache-Lucene**, so the strategy varies. Lucene is an Information Retrieval tool focused on **text retrieval**, which indexes text and enables **full-text** search. This means, that with given a set of documents which contain free text, Lucene is able to search the whole text Database, being it the complete set of free text entries of all the documents.

## Text Search

How is this done? For text search, we have a few steps to be done:

1. Words/sentences are **indexed**, where NLP techniques are used before the actual indexing takes places, such as tokenizing the words and removing stop-words. Thanks to this, index has more condensed information instead of saving all different forms each word can take. **Analyzers** are in charge of this pre-processing.
2. Now, a B-Tree index is built, using words as keys and the list of documents where that word can be found and its position within the text as values.
3. With IR (Information Retrieval), the result of the search is the top-K results that match the query.  Top-K results are calculated using TF-IDF (term frequency - inverse document frequency), the product of two metrics showing how important a word is within a document and across all the corpus.

So why use Text Search on this products dataset? The answer is in the *ingredients*. While other fields may appear or not, like *Salt* or *Calcium*, and we could search for products having different of those values, we could treat *ingredients* as free-text to easily keep out products containing milk before recommending them to users with lactose intolerance.

Also, ElasticSearch fits our needs well, as we do not perform any inserts or updates regularly on this dataset. Given that they are supermarket products and are not likely to change, we can load them once and use it many times. 

> OBS: Any changes would be stored by the system's memory buffer and flushed to disk when the system is not busy, but until then, changes are not really applied!

The reason behind this bad database changing performance is how information is actually retrieved: **All document fields are indexed and answers sent using Index-Only Query Answering**, which means that we do not need to access the disk with the actual data, thus queries are resolved really fast, as ElasticSearch was created as a read-only system.

However, not every text field is treated the same way, as we need to differentiate between *Keywords* and *Text*. 

* Keywords are directly indexed and are not applied any NLP preprocessing. They are useful for structured content, in our case, the *category* field, so we can apply filtering on it.
* Text is the default type for strings and gets analyzed prior to indexing, which makes it a suitable type for full-text values.

## Architecture

When populating the database, documents are stored in a single index and assigned a single mapping type, indicating the type of document and how are they being indexed. For instance,  it informs which string fields should be treated as full text fields or keywords, or whether a field contains numbers, dates, or geolocations. In ElasticSearch [documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/removal-of-types.html) they exemplify this relation between indexes and mappings with a *twitter* index containing *user* and *tweet* types.

With our product data, the question at this point was how to structure the products given that a partitioning could be done with the product category, for example: snacks, drinks or desserts. A possible option could have been using a huge index with every category as a different mapping. However, after version 6.0, the use of different mappings in the same index is discouraged by ElasticSearch team, and it is better to create different indexes for different mappings.

This opens two possibilities:

1. Unique index containing all the data and mapping the category field as a *keyword* used for filtering out data.
2. Different indexes for the different categories.

We still have this question crawling in our heads, so keep tuned! And again, hope this brief introduction was useful to someone :)
