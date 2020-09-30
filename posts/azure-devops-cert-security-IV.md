---
title: AZ-400 - Develop a Security Compliance Plan IV
published: true
description: |
  We've seen how we can use AAD to manage access from
  our applications to other Azure resources. One of the
  resources most linked to security is Azure Key Vault,
  where we are able to store and manage certificates and sensitive
  data that might be required at runtime, such as users
  and passwords.  
category: Cloud
ctime: 2020-10-04
---

The content of this post comes from [Microsoft Learn](https://docs.microsoft.com/en-us/learn/modules/configure-and-manage-azure-key-vault/).

# Configure and manage secrets in Azure Key Vault

Learning objectives:
* Explore proper usage of Azure Key Vault
* Manage access to an Azure Key Vault
* Explore certificate management with Azure Key Vault
* Configure a Hardware Security Module Key-generation solution

## Guidelines for using Azure Key Vault

Azure Key Vault is a centralized cloud service for storing application secrets such as encryption keys, certificates, and server-side tokens. Key Vault helps you control your applications' secrets by keeping them in a single central location and providing secure access, permissions control, and access logging.

### Vaults

Vaults are secure containers of sensitive information and represent logical groups of information - for example one Vault per project / department. They control and log each access to anything stored in them. 

To create a new vault in a RG we can use the portal, Azure CLI:
```
az keyvault create \
    --resource-group <resource-group> \
    --name <your-unique-vault-name>
```

or PowerShell: `New-AzKeyVault -Name <your-unique-vault-name> -ResourceGroupName <resource-group>`.

### Keys

Keys are cryptographic assets that have a particular purpose, such as db data encryption in Azure SQL (Transparent Data Encryption or Column Level Encryption). Once a key is created, the only way to access to it is via cryptography methods on the Key Vault service, so apps never access directly the key.

Keys can be single instanced (only one key exists) or be versioned (where there is a primary active key and multiple archived keys).

> OBS: hardware security modules = HSM

There are two types of keys:
* **Hardware protected keys**: keys are **always** locked to the boundary of the HSM and all operations happen behind it. By *bring your own key* you can import keys to Azure KV without leaving the HSM boundary.
* **Software protected keys**: keys are generated and protected using software-based RSA and ECC algorithms. The primary difference (besides price) with a software-protected key is when cryptographic operations are performed, they are done in software using Azure compute services while for HSM-protected keys the cryptographic operations are performed within the HSM. 

This means that hardware protected keys are recommended for PROD. We can set the `Destination` as Software or HSM at creation time:
```powershell
$key = Add-AzureKeyVaultKey -VaultName 'contoso' -Name 'MyFirstKey' -Destination 'HSM'
```

### Secrets

Secrets are small (less than 10K) data blobs protected by a HSM-generated key created with the Key Vault to simplify the process of persisting sensitive settings that almost every application has such as connection strings.

### Certificate management

Azure KV is also a service that lets you easily provision, manage, and deploy public and private SSL/TLS certificates for use with Azure and your internal connected resources. It can also request and renew TLS certificates through partnerships with certificate authorities, providing a robust solution for certificate lifecycle management.

> OBS: If a user has contributor permissions (RBAC) to a key vault management plane, they can grant themselves access to the data plane by setting a key vault access policy. It's recommended that you tightly control who has contributor access to your key vaults, to ensure that only authorized persons can access and manage your key vaults, keys, secrets, and certificates.

## Manage access to secrets, certificates, and keys

There is no anonymous auth to access KV, all users and apps need to go there via AAD.

### Authorization

Management operations (creating a new Azure Key Vault) use role-based access control (RBAC). There is a built-in role **Key Vault Contributor** that provides access to management features of KV, but doesn't allow access to the data (recommended). There's also a Contributor role that includes full administration rights - including the ability to grant access to the data plane.

The different accesses to keys, secrets and certificates and the operations we can do in each of them (such as get, list, create...) are managed via policies, so that for example we can just give Get and List permissions to an app for the secrets.

### Restricting network access

Another interesting security restriction we can add is related to the network. Usually, there is no need for the KV to go through the whole internet, so we can directly set a VNet subnet or specific IPs.

## Manage certificates

Regarding certificates we need to have two considerations:
1. Private key must be safe, and
2. We need to renew expired certificates periodically.

### Adding Certificates to KV

There are four approaches:

1. Create a self-signed certificates directly in the Azure portal. This process creates a public/private key pair and signs the certificate with its own key. These certificates can be used for testing and development.
2. Create an X.509 certificate signing request (CSR). This creates a public/private key pair + a CSR that we can pass to a Certificate Authority (CA). CA will then give us a X.509 certificate that will be merged with the private key inside the KV -> advantage: the private key is created and secured in Azure Key Vault and never revealed.
3. Directly connect the KV with the CA with a one-time setup. Then, the certificate lifecycle will be automated. This is the most convenient.
4. Import existing certificates - this allows you to add certificates that you are already using. The imported certificate can be in either PFX or PEM format and must contain the private key.

### Retrieving certificates from a Key Vault

Once a certificate is stored in your Azure Key Vault, you can use the Azure portal to explore the certificate properties as well as enable or disable a certificate to make it unavailable to clients.

### Azure App Service integration

We can integrate under settings in the App Service the KV certificate. It must be an X.509 cert with a content type of application/x-pkcs12 and cannot have a password.
