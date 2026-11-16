# EBSLight
 EBS Light Version for Desktop

## Client configuration

The desktop app stores private database and AWS settings outside the packaged application. On first use, it creates a template at:

`%APPDATA%\myebs-app\myebs\private-config.json`

Fill in the `database.password`, `aws.accessKeyId`, `aws.secretAccessKey`, and `recaptchaSecret` values in that file, then restart the app. The template includes the database host, username, and database name. Do not commit or distribute this private file with the installer.
