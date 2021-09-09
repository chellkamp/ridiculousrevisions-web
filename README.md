# ridiculousrevisions-web

*Ridiculous Revisions* is an amateur podcast launched back in March 2021.  This project houses the code for the podcast's website.

## Site Architecture
1. ***AWS Elastic Beanstalk Instance with NodeJS*** - hosts website.
1. ***Database*** - MongoDB or AWS DocumentDB instance; houses show notes.
1. ***AWS Cognito User Pool*** - authentication service; only relevant to admin functions.
1. ***RSS Feed*** - RSS feed for the related podcast.

This project may be run locally in a development environment, but it is meant to be packaged for deployment on an AWS Elastic Beanstalk server.

## Config file
This project relies on a config file to run.  For security reasons, configuration files are kept in a private place not included in this source project.

### Config file format
    {
    	"file_contents": {
    		"DB_CERT": "cert/rds-combined-ca-bundle.pem"
    	},
    	
    	"db": {
    		"USE_DB_CERT": false,
    		"DB_STRING": "mongodb://ridrevsweb:ridrevsweb@localhost:27017/?authSource=admin&validateOptions=true&appname=Ridiculous%20Revisions%20Web&ssl=false",
    		"DB_STRING_EDIT": "mongodb://ridrevswrite:ridrevswrite@localhost:27017/?authSource=admin&validateOptions=true&appname=Ridiculous%20Revisions%20Web&ssl=false",
    		"DB": "ridiculousrevisions",
    		"DB_TABLE": "episode"
    	},
    	"region": "<YOUR_AWS_REGION>",
    	"COGNITO_CLIENT_ID" : "<YOUR_COGNITO_APP_CLIENT_ID>",
    	"COGNITO_USER_POOL_ID": "<YOUR_COGNITO_USER_POOL_ID>",
    	"ADMIN_LOGIN_PAGE": "/admin/login",
    	"PODCAST_RSS_URL": "<YOUR_PODCAST_RSS_FEED_URL>"
    }

Note: **USE_DB_CERT** is **false** here because the example DB is a local MongoDB instance.  When we're using a DocumentDB instance on AWS, **USE_DB_CERT** must be set to **true**.

## Initialize database instance
Run the following scripts inside a MongoDB or DocumentDB command prompt to initialize the database schema:

1. ***deploy\dbcreateusers.js*** - Create users for read/write operations.
1. ***deploy\dbinit.js*** - Creates document collection and indices.

## Run locally on workstation
As this project was created on a Windows machine, examples will use Windows syntax.

To run the site in Next.js *development* mode, open a command window and *cd* to the project root.  From there, run the following command:

    npm run localhostdev -- "\Path\To\Your\CustomConfigFile.config"

To run the site in Next.js *production* mode, open a command window and *cd* to the project root.  From there, run the following command:

    npm run localhostprod -- "\Path\To\Your\CustomConfigFile.config"

## Bundle for Deployment on Elastic Beanstalk
The Windows PowerShell script in this project at **deploy\MakeSourceBundle.ps1** can be used to collect the source and configuration files into an Elastic Beanstalk source bundle.

### Requirments for Source Bundle
1. Config file
1. HTTPS cert file (.pem) and private key file (.pem)
1. Windows with PowerShell installed
1. 7-zip (script assumes location *C:\Program Files\7-Zip\7z.exe*)

### Running MakeSourceBundle.ps1**
In PowerShell, *cd* to *<PROJECT_ROOT>\deploy*.

To build for Next.js *development* mode, run the following:

    .\MakeSourceBundle.ps1 -development

To build for Next.js *production* mode, run the following:

    .\MakeSourceBundle.ps1 -production

During execution, **MakeSourceBundle.ps1** will prompt the user with dialogs to select a config file, a certificate file, and a private key file to go along with that certificate file.  Once complete, the resulting source bundle will reside in the *<PROJECT_ROOT>\build* directory.

## Artwork Sources
- Fonts from [Google Fonts](https://fonts.google.com/)
- Navigation icons from [iconmonstr](https://iconmonstr.com/)
- Background photo from [Unsplash](https://unsplash.com/)
- Title art/favicon by Chris Hellkamp (me)

## TODO List
- Add a *Logout* button to admin pages.
- Integrate AWS S3 bucket into site with access controlled through AWS Cognito Identity Pool.
    - Goal is to upload show scripts through admin pages and make them publicly available for reading through episode detail pages.
