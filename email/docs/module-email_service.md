<div class="navicon">

</div>

[Home](index.md)
------------------

### Modules

-   [email/create\_mail](module-email_create_mail.md)
    -   [create\_email](module-email_create_mail.md#~create_email)
    -   [generateEmail](module-email_create_mail.md#~generateEmail)
-   [email/google\_api\_auth](module-email_google_api_auth.md)
    -   [authorize](module-email_google_api_auth.md#~authorize)
    -   [createNewToken](module-email_google_api_auth.md#~createNewToken)
    -   [storeToken](module-email_google_api_auth.md#~storeToken)
-   [email/service](module-email_service.md)
    -   [request](module-email_service.md#~request)
    -   [request](module-email_service.md#~request)

<div id="main">

email/service {#emailservice .page-title}
=============

<div class="section">

<div class="container-overview">

<div class="description">

This is a service to send email via templates and distribution lists

</div>

Author:

:   -   &lt;gabe@dispatchr.com&gt; (Gabriel Littman)

Source:

:   -   [service.js](service.js.md), [line 1](service.js.md#line1)

</div>

### Methods {#methods .subsection-title}

#### [(inner) ]{.type-signature}request[(options)]{.signature}[]{.type-signature} {#~request .name}

##### Parameters:

+-----------------------+-----------------------+-----------------------+
| Name                  | Type                  | Description           |
+=======================+=======================+=======================+
| `options`             | [Object]{.param-type} | options               |
|                       |                       | ###### Properties     |
|                       |                       |                       |
|                       |                       |   Name           Type |
|                       |                       |                       |
|                       |                       | Description           |
|                       |                       |   -------------- ---- |
|                       |                       | --------------------  |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | -------               |
|                       |                       |   `client`       [Obj |
|                       |                       | ect]{.param-type}     |
|                       |                       | backbone client, if n |
|                       |                       | ot provided client wi |
|                       |                       | ll be created         |
|                       |                       |   `disconnect`   [Boo |
|                       |                       | lean]{.param-type}    |
|                       |                       | if true disconnect fr |
|                       |                       | om client when done   |
|                       |                       |   `timeout`      [Num |
|                       |                       | ber]{.param-type}     |
|                       |                       | millisecond timeout f |
|                       |                       | or the request        |
|                       |                       |   `to`           [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | email address or dist |
|                       |                       | ribution list         |
|                       |                       |   `from`         [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | from who is the email |
|                       |                       |  from                 |
|                       |                       |   `template`     [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | template name         |
|                       |                       |   `subject`      [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | email subject, templa |
|                       |                       | te takes presidence   |
|                       |                       |   `text`         [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | text email body , tem |
|                       |                       | plate takes presidenc |
|                       |                       | e                     |
|                       |                       |   .md`         [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       |.md email body, temp |
|                       |                       | late takes presidence |
|                       |                       |   `dry_run`      [Boo |
|                       |                       | lean]{.param-type}    |
|                       |                       | if ture email service |
|                       |                       |  will not attempt to  |
|                       |                       | send email and return |
|                       |                       |  what would have been |
|                       |                       |  sent                 |
|                       |                       |   `{anything}`   [Any |
|                       |                       | ]{.param-type}        |
|                       |                       | any other option will |
|                       |                       |  be used as template  |
|                       |                       | values                |
+-----------------------+-----------------------+-----------------------+

Source:

:   -   [service.js](service.js.md), [line 16](service.js.md#line16)

#### [(inner) ]{.type-signature}request[(host, port, options)]{.signature}[]{.type-signature} {#~request .name}

##### Parameters:

+-----------------------+-----------------------+-----------------------+
| Name                  | Type                  | Description           |
+=======================+=======================+=======================+
| `host`                | [String]{.param-type} | ip or host name to    |
|                       |                       | connect to backbone   |
+-----------------------+-----------------------+-----------------------+
| `port`                | [String]{.param-type} | port to connect to    |
|                       |                       | backbone              |
+-----------------------+-----------------------+-----------------------+
| `options`             | [Object]{.param-type} | options - these       |
|                       |                       | options will override |
|                       |                       | what is sent in       |
|                       |                       | requests              |
|                       |                       | ###### Properties     |
|                       |                       |                       |
|                       |                       |   Name           Type |
|                       |                       |                       |
|                       |                       | Description           |
|                       |                       |   -------------- ---- |
|                       |                       | --------------------  |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | -------               |
|                       |                       |   `client`       [Obj |
|                       |                       | ect]{.param-type}     |
|                       |                       | backbone client, if n |
|                       |                       | ot provided client wi |
|                       |                       | ll be created         |
|                       |                       |   `disconnect`   [Boo |
|                       |                       | lean]{.param-type}    |
|                       |                       | if true disconnect fr |
|                       |                       | om client when done   |
|                       |                       |   `timeout`      [Num |
|                       |                       | ber]{.param-type}     |
|                       |                       | millisecond timeout f |
|                       |                       | or the request        |
|                       |                       |   `to`           [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | email address or dist |
|                       |                       | ribution list         |
|                       |                       |   `from`         [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | who is the email from |
|                       |                       |   `replyTo`      [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | who is set as reply t |
|                       |                       | o on the email        |
|                       |                       |   `template`     [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | template name         |
|                       |                       |   `subject`      [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | email subject, templa |
|                       |                       | te takes presidence   |
|                       |                       |   `text`         [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       | text email body , tem |
|                       |                       | plate takes presidenc |
|                       |                       | e                     |
|                       |                       |   .md`         [Str |
|                       |                       | ing]{.param-type}     |
|                       |                       |.md email body, temp |
|                       |                       | late takes presidence |
|                       |                       |   `dry_run`      [Boo |
|                       |                       | lean]{.param-type}    |
|                       |                       | if ture email service |
|                       |                       |  will not attempt to  |
|                       |                       | send email and return |
|                       |                       |  what would have been |
|                       |                       |  sent                 |
|                       |                       |   `{anything}`   [Any |
|                       |                       | ]{.param-type}        |
|                       |                       | any other option will |
|                       |                       |  be used as template  |
+-----------------------+-----------------------+-----------------------+

Source:

:   -   [service.js](service.js.md), [line 59](service.js.md#line59)

</div>

</div>

\

Documentation generated by [JSDoc
3.4.0](https://github.com/jsdoc3/jsdoc) on Thu Dec 15 2016 23:39:52
GMT-0800 (PST) using the Minami theme.
