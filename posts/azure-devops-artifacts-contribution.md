---
title: Azure DevOps - Facilitating internal package contribution
published: true
description: |
  When developing new solutions we usually find ourselves
  applying common patterns: read data from a db,
  logging structure, reaching a service X, etc.
  A useful approach to reducing boilerplate and 
  helping ourselves in improving these capabilities
  is by centralizing and contributing as a team.
  In this post, we will see how to create a custom Python package
  and use it across our different projects with Azure DevOps.
category: Cloud
ctime: 2020-12-03
---

It is actually funny how we use to invest time and effort into improving our projects but we leave apart improvements on how we work and collaborate. With this post I'm just going to write down some simple steps that can improve collaboration, reduce the time we spend writing the same stuff, and therefore increasing the quality of our deliverables.

We are going to review:

1. What we need to create a custom Python package.
2. What are Artifacts and how we will use them.
3. How to define a build that creates our package.
4. How to define a Release that actually publishes the package to the Artifacts.
5. How to consume the package locally.
6. How to consume the package in a Function App.

In the end we want a capability that is easy to use and easy to collaborate to, as we want all our team to push and improve the solution.

## Creating a custom package

[Here](https://packaging.python.org/tutorials/packaging-projects/) we have all the information we need to configure our new package. Note how in the `setup.py` file we are going to store all the information related to our package. One of most important things to note here is the `version` field, which will help us evolve the common utilities, publish them separated and therefore allowing solutions dependant on older versions to keep working correctly.

Once we have our setup (heh) ready, we can build our package running:

```python
python3 setup.py sdist
```

## Artifacts

After creating a repo in Azure DevOps that will contain our common utilities, we should proceed and create a new [Artifacts Feed](https://docs.microsoft.com/es-es/azure/devops/artifacts/concepts/feeds?view=tfs-2018), which allows us to *store, manage, and group packages and control who to share it with*. Here we are going to create an index alternative to [PyPI](https://pypi.org/), so that in our `requirements.txt` we can both use "usual" modules and custom private packages.

> OBS: Note that if you prefer, you can also configure [Upstream Sources](https://docs.microsoft.com/en-us/azure/devops/artifacts/concepts/upstream-sources?view=azure-devops) so that you have centralized internal and external packages instead of having two different sources.

## Build

We want to make everyone's lives easier, so we need to provide proper CICD capabilities. Let's start by creating a build pipeline where we can run all our tests and create the package. I like using YAML definition for the pipelines, so we need to make sure to add these last steps, where we create the package as shown before, and publish as a pipeline artifact that we can consume later in the release.

```yaml
- script: |
    python3 setup.py sdist
  displayName: 'Artifact creation'

- task: CopyFiles@2
  inputs:
    targetFolder: $(Build.ArtifactStagingDirectory)

- task: PublishBuildArtifacts@1
  inputs:
    PathtoPublish: '$(Build.ArtifactStagingDirectory)'
    ArtifactName: 'target'
    publishLocation: 'Container'
```

> OBS: Instead of separating the CICD process in a build & release, we could just have all the process in the build. However, if we want to have approvals or gates, releases are the way to go and this is what we are going to showcase here.

## Release

What will happen in the Release then is that we will grab the Pipeline Artifact that was just generated, and publish it to the Artifact Feed. To do so, we will use the [twine](https://pypi.org/project/twine/) library, which will help us automatically authenticate to the Feed and upload our package:

<img src="../../images/posts/cloud/artifacts/twine-auth.png" class="w-84 my-4 justify-center m-auto">

I like to make sure to do everything with Python3, so apart from selecting the version we want, we will need to install twine:

```python
python3 -m pip install twine
```

And finally upload the package:

```bash
twine upload -r $(artifactFeed) --config-file $(PYPIRC_PATH) $(System.DefaultWorkingDirectory)/pipeline-artifact-name/target/dist/*
```

Note how we are using custom variables with `$(var-name)` syntax, that you can store in a Variable Group in the library, and also built-in variables such as `$(System.DefaultWorkingDirectory)`. Also, we are using `PYPIRC_PATH`, which is generated in the Twine Auth step.

At the end of the release, we should be able to find our package in the feed :)


## Consume the package locally

When looking for our new package in the Artifacts, we can follow the instructions to "Connect to Feed". Here we want to locate the index URL, which will be something like:

```
https://pkgs.dev.azure.com/<project-name>/_packaging/<feed-name>/pypi/simple/
```

Then, in the `requirements.txt` in our separate project we can set at the top:

```
--extra-index-url https://pkgs.dev.azure.com/<project-name>/_packaging/<feed-name>/pypi/simple/
random_package==0.1
my_package==1.0
```

When we then run `pip install -r requirements.txt`, we can authenticate for the first time via the browser, and we are good to go!

## Consume the package for a Function App

After developing our solution, we most surely want to deploy it somewhere. The tricky part here is how to achieve an automatic authentication so that our function app can be build remotely.

If we used the Twine Auth task for uploading, now we will make use of the Pip Auth to consume it. Therefore, we want to run:

```yaml
- task: PipAuthenticate@0
    displayName: Authenticate with artifact feed
    inputs:
      artifactFeeds: my-feed
      onlyAddExtraIndex: true
```

Here there is one important thing happening: As we have set `onlyAddExtraIndex: true`, we are following the same strategy as in the `requirements.txt` before, where we say that we are also relying on the usual / default PyPI index. Therefore, an environment variable `PIP_EXTRA_INDEX_URL` will be created in the DevOps pipeline holding the necessary information the application needs to connect and authenticate to the feed.

Keeping that in mind, we can then publish our Function App using Azure Function Core Tools as:

```bash
az functionapp config appsettings set --name $(functionApp) --resource-group $(resourceGroup) --settings PIP_EXTRA_INDEX_URL=$PIP_EXTRA_INDEX_URL
func azure functionapp publish $(functionApp) --python
```

> OBS: We could also be generating a custom Docker image, but this approach is much more simple. Moreover, we are using the default `--build remote` setting, as if we want to use libs that need system dependencies, remote build is required.

## Contribution

Finally, another interesting thing Azure DevOps offers is the possibility to create custom [Pull Request templates](https://docs.microsoft.com/en-us/azure/devops/repos/git/pull-request-templates?view=azure-devops)! This will help when guiding the team on what to consider when making a PR.

One of the options is to prepare a default template with 2 steps:

1. Create a directory in the project root called `.azuredevops`.
2. Define your template with Markdown syntax in a file called `pull_request_template.md` in the former folder.

A nice structure could be as follows:

```md
Thank you for your contribution to our super fun package :D
Before submitting the PR, please make sure:

- [ ] Your code builds correctly. We will see it in the failed build validation otherwise...
- [ ] You have added unit tests
- [ ] You have updated the version in `setup.py` if you modified any existing functionality.

Thanks!
```

## Summary

I know this was more a schematic view rather than a step-by-step guide, as there's nothing better than Microsoft's docs, so the idea is just to give some guidelines on what you'd need to look at.

Thanks for reading, I hope this compilation of info was useful. Feel free to fire up any questions in LinkedIn.
