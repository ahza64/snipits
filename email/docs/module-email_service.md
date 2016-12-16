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

email/service
=============

This is a service to send email via templates and distribution lists

Author:  
-   &lt;gabe@dispatchr.com&gt; (Gabriel Littman)

Source:  
-   [service.js](service.js.md), [line 1](service.js.md#line1)

### Methods

#### <span class="type-signature">(inner) </span>request<span class="signature">(options)</span><span class="type-signature"></span>

##### Parameters:

<table>
<colgroup>
<col width="33%" />
<col width="33%" />
<col width="33%" />
</colgroup>
<thead>
<tr class="header">
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>options</code></td>
<td><span class="param-type">Object</span></td>
<td>options
<h6 id="properties">Properties</h6>
<table>
<thead>
<tr class="header">
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>client</code></td>
<td><span class="param-type">Object</span></td>
<td>backbone client, if not provided client will be created</td>
</tr>
<tr class="even">
<td><code>disconnect</code></td>
<td><span class="param-type">Boolean</span></td>
<td>if true disconnect from client when done</td>
</tr>
<tr class="odd">
<td><code>timeout</code></td>
<td><span class="param-type">Number</span></td>
<td>millisecond timeout for the request</td>
</tr>
<tr class="even">
<td><code>to</code></td>
<td><span class="param-type">String</span></td>
<td>email address or distribution list</td>
</tr>
<tr class="odd">
<td><code>from</code></td>
<td><span class="param-type">String</span></td>
<td>from who is the email from</td>
</tr>
<tr class="even">
<td><code>template</code></td>
<td><span class="param-type">String</span></td>
<td>template name</td>
</tr>
<tr class="odd">
<td><code>subject</code></td>
<td><span class="param-type">String</span></td>
<td>email subject, template takes presidence</td>
</tr>
<tr class="even">
<td><code>text</code></td>
<td><span class="param-type">String</span></td>
<td>text email body , template takes presidence</td>
</tr>
<tr class="odd">
<td><code>html</code></td>
<td><span class="param-type">String</span></td>
<td>html email body, template takes presidence</td>
</tr>
<tr class="even">
<td><code>dry_run</code></td>
<td><span class="param-type">Boolean</span></td>
<td>if ture email service will not attempt to send email and return what would have been sent</td>
</tr>
<tr class="odd">
<td><code>{anything}</code></td>
<td><span class="param-type">Any</span></td>
<td>any other option will be used as template values</td>
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
</tbody>
</table></td>
</tr>
</tbody>
</table>

Source:  
-   [service.js](service.js.md), [line 16](service.js.md#line16)

#### <span class="type-signature">(inner) </span>request<span class="signature">(host, port, options)</span><span class="type-signature"></span>

##### Parameters:

<table>
<colgroup>
<col width="33%" />
<col width="33%" />
<col width="33%" />
</colgroup>
<thead>
<tr class="header">
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>host</code></td>
<td><span class="param-type">String</span></td>
<td>ip or host name to connect to backbone</td>
</tr>
<tr class="even">
<td><code>port</code></td>
<td><span class="param-type">String</span></td>
<td>port to connect to backbone</td>
</tr>
<tr class="odd">
<td><code>options</code></td>
<td><span class="param-type">Object</span></td>
<td>options - these options will override what is sent in requests
<h6 id="properties-1">Properties</h6>
<table>
<thead>
<tr class="header">
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>client</code></td>
<td><span class="param-type">Object</span></td>
<td>backbone client, if not provided client will be created</td>
</tr>
<tr class="even">
<td><code>disconnect</code></td>
<td><span class="param-type">Boolean</span></td>
<td>if true disconnect from client when done</td>
</tr>
<tr class="odd">
<td><code>timeout</code></td>
<td><span class="param-type">Number</span></td>
<td>millisecond timeout for the request</td>
</tr>
<tr class="even">
<td><code>to</code></td>
<td><span class="param-type">String</span></td>
<td>email address or distribution list</td>
</tr>
<tr class="odd">
<td><code>from</code></td>
<td><span class="param-type">String</span></td>
<td>who is the email from</td>
</tr>
<tr class="even">
<td><code>replyTo</code></td>
<td><span class="param-type">String</span></td>
<td>who is set as reply to on the email</td>
</tr>
<tr class="odd">
<td><code>template</code></td>
<td><span class="param-type">String</span></td>
<td>template name</td>
</tr>
<tr class="even">
<td><code>subject</code></td>
<td><span class="param-type">String</span></td>
<td>email subject, template takes presidence</td>
</tr>
<tr class="odd">
<td><code>text</code></td>
<td><span class="param-type">String</span></td>
<td>text email body , template takes presidence</td>
</tr>
<tr class="even">
<td><code>html</code></td>
<td><span class="param-type">String</span></td>
<td>html email body, template takes presidence</td>
</tr>
<tr class="odd">
<td><code>dry_run</code></td>
<td><span class="param-type">Boolean</span></td>
<td>if ture email service will not attempt to send email and return what would have been sent</td>
</tr>
<tr class="even">
<td><code>{anything}</code></td>
<td><span class="param-type">Any</span></td>
<td>any other option will be used as template</td>
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
<tr class="even">
</tr>
<tr class="odd">
</tr>
</tbody>
</table></td>
</tr>
</tbody>
</table>

Source:  
-   [service.js](service.js.md), [line 59](service.js.md#line59)

Documentation generated by [JSDoc 3.4.0](https://github.com/jsdoc3/jsdoc) on Thu Dec 15 2016 23:39:52 GMT-0800 (PST) using the Minami theme.
