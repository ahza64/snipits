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

email/create\_mail {#emailcreate_mail .page-title}
==================

<div class="section">

<div class="container-overview">

</div>

### Methods {#methods .subsection-title}

#### [(inner) ]{.type-signature}create\_email[(options)]{.signature}[ → {Object|Object|Object|Object}]{.type-signature} {#~create_email .name}

##### Parameters:

+-----------------------+-----------------------+-----------------------+
| Name                  | Type                  | Description           |
+=======================+=======================+=======================+
| `options`             | [Object]{.param-type} | options               |
|                       |                       | ###### Properties     |
|                       |                       |                       |
|                       |                       |   Name         Type   |
|                       |                       |                    De |
|                       |                       | scription             |
|                       |                       |   ------------ ------ |
|                       |                       | ------------------ -- |
|                       |                       | --------------------- |
|                       |                       | --------------------- |
|                       |                       | -                     |
|                       |                       |   `to`         [Strin |
|                       |                       | g]{.param-type}    em |
|                       |                       | ail address or distri |
|                       |                       | bution list           |
|                       |                       |   `from`       [Strin |
|                       |                       | g]{.param-type}    fr |
|                       |                       | om who is the email f |
|                       |                       | rom                   |
|                       |                       |   `replyTo`    [Strin |
|                       |                       | g]{.param-type}    fr |
|                       |                       | om who should be set  |
|                       |                       | as reply to           |
|                       |                       |   `template`   [Strin |
|                       |                       | g]{.param-type}    te |
|                       |                       | mplate name           |
|                       |                       |   `subject`    [Strin |
|                       |                       | g]{.param-type}    em |
|                       |                       | ail subject, template |
|                       |                       |  takes presidence     |
|                       |                       |   `text`       [Strin |
|                       |                       | g]{.param-type}    te |
|                       |                       | xt email body , templ |
|                       |                       | ate takes presidence  |
|                       |                       |   .md`       [Strin |
|                       |                       | g]{.param-type}    ht |
|                       |                       | ml email body, templa |
|                       |                       | te takes presidence   |
|                       |                       |   `send`       [Boole |
|                       |                       | an]{.param-type}   if |
|                       |                       |  ture email will be s |
|                       |                       | ent                   |
+-----------------------+-----------------------+-----------------------+

Source:

:   -   [create\_mail.js](create_mail.js.md), [line
        145](create_mail.js.md#line145)

##### Returns:

-   <div class="param-desc">

    result

    </div>

     Type 
    :   [Object]{.param-type}

-   <div class="param-desc">

    result.sent true if email was sent

    </div>

     Type 
    :   [Object]{.param-type}

-   <div class="param-desc">

    result.error error message if email not sent

    </div>

     Type 
    :   [Object]{.param-type}

-   <div class="param-desc">

    result.{other} other final options used to send email

    </div>

     Type 
    :   [Object]{.param-type}

#### [(inner) ]{.type-signature}generateEmail[()]{.signature}[]{.type-signature} {#~generateEmail .name}

Source:

:   -   [create\_mail.js](create_mail.js.md), [line
        115](create_mail.js.md#line115)

</div>

</div>

\

Documentation generated by [JSDoc
3.4.0](https://github.com/jsdoc3/jsdoc) on Thu Dec 15 2016 23:39:52
GMT-0800 (PST) using the Minami theme.
