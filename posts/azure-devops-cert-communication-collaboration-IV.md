---
title: AZ-400 - Facilitate Communication & Collaboration IV
published: true
description: |
  Here there are two more capabilities of the
  devops taxonomy.
  We want to follow a fast-paced stream of
  dev-test-deploy-measure. Continuous Delivery
  is the practice that allows us to automate the
  propagation of changes through multiple
  environments, while with Continuous Quality
  we need to ensure that the overall quality
  of the app is increasing.
category: Cloud
ctime: 2020-10-12
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/explain-devops-continous-delivery-quality/).

## Explain DevOps Continuous Delivery and Continuous Quality

Learning Objectives
* Explain Continuous Delivery
* Compare Continuous Delivery and Continuous Integration
* List the benefits, challenges and risks of Continuous Quality
* Describe the Continuous Quality mindset
* Compare Continuous Quality and Traditional Quality assurance

## Use Continuous Delivery to release faster, with smaller costs and risks

Continuous Delivery is a software engineering approach in which teams produce software in short cycles, ensuring that the software can be:

* Reliably released at any time
* Released manually

Its purpose is:
* Build, test, and release software with greater speed and frequency
* Reduce the cost, time, and risk of delivering changes by allowing for more incremental updates to applications in production

Continuous Delivery happens when:

* Software is deployable throughout its lifecycle
* Continuous Integration as well as extensive automation are available through all possible parts of the delivery process, typically using a deployment pipeline
* It’s possible to perform push-button deployments of any version of the software to any environment on demand

> OBS: The difference between continuous delivery and continuous deployment is that with the first, there is a manual approval of deployment to prod after the acceptance tests have passed. In Continuous Deployment, the step between acceptance tests and deployment to prod is automated.

he most important question to ask as a way to understand delivery performance in an organization is "How big is your deployment pain to production?".

Continuous Integration is a prerequisite for Continuous Delivery. Practices in place enable building and (reliably) deploying the application at any time and with high quality, from source control.

## Explore Continuous Quality

Why do you need quality?

* To make products salable.
* To reduce costs.
* To set you apart from competition.
  
Key benefits of Continuous Quality include:

* A "quality-first" mindset that promotes a shared responsibility for quality.
* Reduction of waste due to frequent rework caused by defects.
* Less technical debt due to missing quality requirements accumulating over time.
* Greater customer satisfaction.
* Fewer incidents that disrupt the business.

Focusing on quality as early as possible in the development cycle results in significant savings of time and effort.

A Continuous Quality mindset:

* Encourages growth and innovation, and creates the culture that enables and nurtures quality-driven behaviors.
* Knows that quality is built-in, that it can’t be tested-in.
* Prioritizes quality over new features.
* Advocates teamwork.
* Takes responsibility for deliverables.
* Shifts testing sideways.

A false assumption should you beware of when striving for Continuous Quality is The more bugs that are found and fixed, the better the quality. Moreover, people responsible for the existence in bugs in software are the product owner, the coder and the tester.
