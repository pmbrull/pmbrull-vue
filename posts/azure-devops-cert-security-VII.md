---
title: AZ-400 - Develop a Security Compliance Plan VII
published: true
description: |
  Securing the platform and monitoring its usage is essential,
  but sometimes we actually forget that we also need to be
  that demanding when securing our code, check its dependencies,
  look for vulnerabilities, etc. Let's see now how to maintain
  a secure repository.
category: Cloud
ctime: 2020-10-07
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/maintain-secure-repository-github/).

## Maintain a secure repository by using GitHub best practices

Learning objectives:
* Enable vulnerable dependency detection for private repositories
* Detect and fix outdated dependencies with security vulnerabilities
* Automate the detection of vulnerable dependencies with Dependabot
* Add a security policy with a `SECURITY.md` file
* Remove a commit exposing sensitive data in a pull request
* Keep sensitive files out of your repository by leveraging the use of a `.gitignore` file
* Remove historical commits exposing sensitive data deep in your repository

## How to maintain a secure GitHub repository

With Github we usually work with special / reserved files that fulfill specific purposes. Some of them are:
* `SECURITY.md`: Here we can define a security policy for our application, which means that we guide how a security issues needs to be communicated, instead of opening a public issue with information that can then be exploited. This is known as Adding a security policy to the repository.
* `.gitignore`: To avoid sensitive information in our directories to be commited to the repo. Here we can list specific files or general paths as `config/`.

## Removing sensitive data from a repository

If any commit has sensitive data commited, it can be leaked. It is not enough to overwrite the commit, we need to make sure it is completely deleted. To entirely remove unwanted files from a repository's history you can use either the `git filter-branch` command or the BFG Repo-Cleaner open source tool.

We can use `git filter-branch` to remove specific compromising files from any commit - which will then be updated together with its SHA - as follows:

```
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch PATH-TO-YOUR-FILE-WITH-SENSITIVE-DATA" \
  --prune-empty --tag-name-filter cat -- --all
```

We should then add `PATH-TO-YOUR-FILE-WITH-SENSITIVE-DATA` to the `.gitignore` file.

## Detecting and fixing outdated dependencies with security vulnerabilities

Each dependency we use in our project might become a security risk. Github scans usual package manifests such as `requirements.txt` or `package.json` to create a dependency graph that can be used to traverse all the dependencies a project relies on. 

GitHub provides automated dependency alerts that watch your dependency graphs for you. It then cross-references target versions with versions on known vulnerability lists. When a risk is discovered, the project is alerted.

## Automated dependency updates with Dependabot

It scans for dependency alerts and creates pull requests so that a contributor can validate the update and merge the request.
