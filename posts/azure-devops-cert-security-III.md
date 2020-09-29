---
title: AZ-400 - Develop a Security Compliance Plan III
published: true
description: |
  How can we securely access the resources used in each project?
  We will now play around the one of the authentication tools 
  provided by Azure: service principals and managed identities.
category: Cloud
ctime: 2020-10-03
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/authenticate-apps-with-managed-identities/).

# Authenticate apps to Azure services by using service principals and managed identities for Azure resources

With all applications we face a problem: how to handle sensitive configs, such as users and passwords. With Azure, there is an auth method that works to reduce all of this hassle: service principals and managed identities.

Learning objectives:
* Identify the benefits of and use cases for service principals.
* Identify the benefits of using managed identities for Azure resources.
* Enable managed identities on an Azure VM.
* Use managed identities with Azure SDKs in applications.

## Authentication with service principals in Azure AD

Service principals are identities managed by AAD that represent an app or service. We can then grant this application access to other services in Azure in the tenant they live. In the Azure portal, we create an AAD application and associate this object to a service principal. Service principal can be created via portal, Azure CLI, PS or API.

### Using Microsoft identity platform in your applications

Microst Identity Platform provides a unified way to authenticate your apps. When the app is successfully authenticated in AD, it receives a token that is what will be used to use API or call other services. To build an application, use Microsoft Authentication Library (MSAL) to provide single sign-on support.

To create an application using Microsoft Identity Platform in the portal go to: AAD > App Registrations > New Registration.

### Assigning application roles

An application's roles determine its permissions and scope (recall how Azure uses RBAC). Roles can be managed in the Access Control (IAM) panel in the service or even the RG (note that then the services will inherit permissions).

Then, to access another service we need two parameters:
* **Directory (tenant) ID**
* **Application (client) ID**

Finally, the auth process can be done either via:
* **Certificate**: (or public key) - generate it locally and then upload the .cer, .pem, or .crt file. Or,
* **Client secret**: string that acts as the app password.

Note that when our application passes a token to Azure, **Azure Resource Manager** is used to authenticate the to the resource.

> OBS: Because certificates can expire, for the best security, set the client secret to expire. Managing these credentials is a downside of apps that use a service principal to access Azure resources.

### When to use service principals

* Your application or service is running on-premises.
* The resources or applications that you need to access don't support managed identities.

Managed Identities are the preferred way to handle auth.

## Authentication with managed identities

Azure managed identity is a feature of Azure Active Directory (Azure AD) that you can use free of charge. This feature automatically creates identities to allow apps to authenticate with Azure resources and services (that support this feature). To use managed identities, you don't need to provide authentication credentials in code.

The managed identity feature solves the credential problem by granting an automatically managed identity. You use this service principal to authenticate to Azure services.

### How managed identities work

Some common terms:
* **Client ID**: A unique ID linked to the AAD application and service principal that was created when you provisioned the identity.
* **Object ID**: The service principal object of the managed identity.
* **Azure Instance Metadata Service**: A REST API that's enabled when Azure Resource Manager provisions a VM. The endpoint is accessible only from within the VM.

There are two types of managed identities. They are similar but used differently:

* **System-assigned managed identity**: This is enabled directly on an Azure service instance (such as a VM). Azure then creates a service principal through Azure Resource Manager. This service principal is coupled with the resource that is connected to the information about the managed identity on the tenant: this means that for two VMs, we need to enable the managed identity in both. If the resource is deleted, so is the managed identity. A resource can have only one system-assigned managed identity.
* **User-assigned managed identity**: It is created as a standalone Azure resource, independently of any app. Azure then creates a service principal as with the system-assigned managed identity. However, the clue here is that this user-assigned MI is not coupled to a specific resource, so it can be assigned to multiple applications. For two VMs, we would just need to assign this to both VMs, not create two MIs.

> OBS: You can view all your managed identities in the Enterprise Applications page on AAD.

> OBS2: a custom application that's hosted on-premises cannot use managed identities, they can be used only in Azure resources or through Azure AD integration.

To set up a managed identity for a resource go to Settings > Identity (for example in our VMs).

## Use managed identities with Azure virtual machines

You can assign a managed identity to a VM during its build time. Or you can assign it to an existing VM by using the portal, the Azure CLI, or PowerShell script.

The creation process is the following:

Here's the process:

1. From Azure Resource Manager, the VM sends a request for a managed identity.
1. In Azure Active Directory (Azure AD), a service principal is created for the VM within the tenant that the subscription trusts.
1. Azure Resource Manager updates the Azure Instance Metadata Service identity endpoint with the service principal client ID and certificate.
1. The new service principal information is used to grant the VM access to Azure resources. To give your app access to the key vault, use role-based access control (RBAC) in Azure AD. Assign the required role to the VM's service principal. For example, assign the read role or contribute role.
1. A call is made to Azure AD to request an access token by using the client ID and certificate.
1. Azure AD returns a JSON Web Token access token.

When the configuration finishes, you don't need to create any additional credentials to access the resources.
### Using managed identity in an application

An application that runs on an Azure resource, such as a VM or a function app, uses a managed identity to authenticate and access other resources.

The authentication and access process involves a series of requests to the Azure Instance Metadata Service:

1. The service validates the identity that's associated with your app.
1. It generates a resource access token.
1. Your app sends the token to the resource that it needs to access.
1. The token is authenticated.
1. If the token is valid, the resource verifies that the token represents an identity that has the appropriate authorization for the request.
1. When this test passes, your application can access the resource.

We can use an API in our code to generate a token and access resources:

```c#
AzureServiceTokenProvider azureServiceTokenProvider = new AzureServiceTokenProvider();
var token = await azureServiceTokenProvider.GetAccessTokenAsync("https://storage.azure.com/");
```

### Examples

Note the difference between creating a system or a user identities:

* System (e.g., for a VM)
    ```
    az vm identity assign \
      --name $VMNAME \
      --resource-group [Sandbox resource group]
    ```
* User
    ```
    az identity create \
      --name <identity name>
      --resource-group <resource group>
    ```

To then assign the user managed identity to a resource, use the principal ID to associate the identity with your resources.

```
az functionapp identity assign \
  --name <function app name> \
  --resource-group <resource group> \
  --role <principal id>
```

Afterwards, we can grant our app running as an App Function some permissions on a Key Vault:

```
az keyvault set-policy \
    --name <key vault name> \
    --object-id <principal id> \
    --secret-permissions get list
```

### Using managed identity with Azure Key Vault

Now that we have seen how to link our app to KV using managed identities, let's see what code pieces we need to add to actually retrieve securely secrets from KV:

First, recall the piece of code above that we used with `AzureServiceTokenProvider`. Here it works similarly:

```c#
KeyVaultClient keyVaultClient = new KeyVaultClient(
    new KeyVaultClient.AuthenticationCallback(azureServiceTokenProvider.KeyVaultTokenCallback));
```

However, instead of generating a token, we are calling `KeyVaultTokenCallback`, which returns a delegate object used to generate and authenticate the access token for KV. Finally:

```c#
string keyVaultName = ...;
string keyVaultSecretName = ...;
var secret = await keyVaultClient
    .GetSecretAsync($"https://{keyVaultName}.vault.azure.net/secrets/{keyVaultSecretName}")
    .ConfigureAwait(false);

Console.WriteLine($"Secret: {secret.Value}");
```
