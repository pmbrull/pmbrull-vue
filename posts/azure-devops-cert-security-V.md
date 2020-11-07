---
title: AZ-400 - Develop a Security Compliance Plan V
published: true
description: |
  APIs can be sensitive elements, and even more if we are
  opening them to the internet. With Azure API Management
  we can add a really convenient control layer on top
  of our API to manage and control who and how accesses it.
category: Cloud
ctime: 2020-10-05
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/control-authentication-with-apim/).

## Control authentication for your APIs with Azure API Management

Learning objectives:
* Create an Azure API gateway
* Import a RESTful API into the gateway
* Implement policies to secure the API from unauthorized use
* Call an API to test the applied policies

## What is API Management?

APIM provides the core competencies to ensure a successful API program through developer engagement, business insights, analytics, security, and protection. It can be integrated on top of any backend.

APIM is made up of the following components:

* **API gateway** - Endpoint that:
  * Accepts API calls and routes them to the backend.
  * Verifies API keys, JWT tokens, certificates, and other credentials.
  * Enforces usage quotas and rate limits.
  * Transforms your API on the fly without code modifications.
  * Caches backend responses where set up.
  * Logs call metadata for analytics purposes.

* **Azure portal** - Administrative interface where we set the API program. It can be used to:
  * Define or import API schema.
  * Package APIs into products.
  * Set up policies such as quotas or transformations on the APIs.
  * Get insights from analytics.
  * Manage users.

* **Developer portal** - Main web presence for developers:
  * Read API documentation.
  * Try out an API via the interactive console.
  * Create an account and subscribe to get API keys.
  * Access analytics on their own usage.

## Create subscriptions in Azure API Management

When we publish an API with APIM, we define who can access the API through the gateway.

> OBS: Subscriptions here have nothing to do with Azure subscriptions!

### Subscriptions and Keys

Access to the API is controlled by using a subscription, which can segment the access level to an API (which allows us to set different pricing tiers). Subscription keys form the authorization to enable access to these subscriptions: if the request does not contain a valid key, the call will be rejected.

A subscription key is a unique auto-generated key that can be passed through in the headers of the client request or as a query string parameter.

There are three subscription scopes:
* All APIs: giving access to all accessible APIs from the gateway
* Single API: applies to a single imported API and all of its endpoints
* Product: A product is a collection of one or more APIs (and we can assign one API to multiple products). Products can have different access rules, usage quotas, and terms of use.

> OBS: subscription keys can be regenerated at any time. Also, note that by having a primary and secondary key we avoid downtime, as we can regenerate one at a time.

The workflow of key management is: developers make a request > request is approved > key is sent securely.

### Call an API with the subscription key

When calling the API protected under a subscription, the default header name is **Ocp-Apim-Subscription-Key**, and the default query string is **subscription-key**. As an example:

```bash
curl --header "Ocp-Apim-Subscription-Key: <key string>" https://<apim gateway>.azure-api.net/api/path
```

```bash
curl https://<apim gateway>.azure-api.net/api/path?subscription-key=<key string>
```

If the key is not passed, the client will receive a 401 Access Denied.

### Import the API

To import our API that is deployed to App Service into APIM there are two steps:

1. Create our API with a Swagger JSON URL.
2. At the APIM service > Add New API > OpenAPI > OpenAPI Specification to add the Swagger JSON URL.

Subscriptions can then be created in the APIM, at the Subscriptions panel.

## Use client certificates to secure access to an API

Certificates can be used to provide TLS mutual authentication between the client and the API gateway. You can configure the API Management gateway to allow only requests with certificates containing a specific thumbprint. The authorization at the gateway level is handled through inbound policies.

### TLS client authentication

We can create our own policy requirements where APIM will inspect the certificate contained within the client request for specific Certificate Authority (CA), Thumbprint, Subject and / or expiration date.

Moreover, all certificates must be signed for extra security. To ensure this, we need to check who issued the certificate to see if it was a CA we trust.

### Accepting client certificates in the Consumption tier

The Consumption tier in API Management is designed to conform with serverless design principals. If you build your APIs from serverless technologies, such as Azure Functions, this tier is a good fit. In the Consumption tier, you must explicitly enable the use of client certificates, which you can do on the Custom domains page. This step is not necessary in other tiers.
