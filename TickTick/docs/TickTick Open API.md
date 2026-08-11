# [TickTick Open API](#/openapi?id=ticktick-open-api)

## [Introduction](#/openapi?id=introduction)

Welcome to the TickTick Open API documentation. TickTick is a powerful task management application that allows users to easily manage and organize their daily tasks, deadlines, and projects. With TickTick Open API, developers can integrate TickTick's powerful task management features into their own applications and create a seamless user experience.

## [Getting Started](#/openapi?id=getting-started)

To get started using the TickTick Open API, you will need to register your application and obtain a client ID and client secret. You can register your application by visiting the [TickTick Developer Center](https://developer.ticktick.com/manage). Once registered, you will receive a client ID and client secret which you will use to authenticate your requests.

## [Authorization](#/openapi?id=authorization)

### [Get Access Token](#/openapi?id=get-access-token)

In order to call TickTick's Open API, it is necessary to obtain an access token for the corresponding user. TickTick uses the OAuth2 protocol to obtain the access token.

#### [First Step](#/openapi?id=first-step)

Redirect the user to the TickTick authorization page, [https://ticktick.com/oauth/authorize](https://ticktick.com/oauth/authorize). The required parameters are as follows:

| Name           | Description                                                                                  |
|----------------|----------------------------------------------------------------------------------------------|
| client\_id     | Application unique id                                                                        |
| scope          | Spaces-separated permission scope. The currently available scopes are tasks:write tasks:read |
| state          | Passed to redirect url as is                                                                 |
| redirect\_uri  | User-configured redirect url                                                                 |
| response\_type | Fixed as code                                                                                |

Example:  
[https://ticktick.com/oauth/authorize?scope=scope&amp;client\_id=client\_id&amp;state=state&amp;redirect\_uri=redirect\_uri&amp;response\_type=code](https://ticktick.com/oauth/authorize?scope=scope&client_id=client_id&state=state&redirect_uri=redirect_uri&response_type=code)

#### [Second Step](#/openapi?id=second-step)

After the user grants access, TickTick will redirect the user back to your application's `redirect_uri` with an authorization code as a query parameter.

| Name  | Description                                     |
|-------|-------------------------------------------------|
| code  | Authorization code for subsequent access tokens |
| state | state parameter passed in the first step        |

#### [Third Step](#/openapi?id=third-step)

To exchange the authorization code for an access token, make a POST request to `https://ticktick.com/oauth/token` with the following parameters(Content-Type: application/x-www-form-urlencoded):

| Name           | Description                                                                                     |
|----------------|-------------------------------------------------------------------------------------------------|
| client\_id     | The username is located in the **HEADER** using the **Basic Auth** authentication method        |
| client\_secret | The password is located in the **HEADER** using the **Basic Auth** authentication method        |
| code           | The code obtained in the second step                                                            |
| grant\_type    | grant type, now only authorization\_code                                                        |
| scope          | spaces-separated permission scope. The currently available scopes are tasks: write, tasks: read |
| redirect\_uri  | user-configured redirect url                                                                    |

Access\_token for openapi request authentication in the request response

```
 {  
...  
"access_token": "access token value"  
...  
}  
```

#### [Request OpenAPI](#/openapi?id=request-openapi)

Set **Authorization** in the header, the value is **Bearer** `access token value`

```
Authorization: Bearer e*****b
```

## [API Reference](#/openapi?id=api-reference)

The TickTick Open API provides a RESTful interface for accessing and managing user tasks, lists, and other related resources. The API is based on the standard HTTP protocol and supports JSON data formats.

### [Task](#/openapi?id=task)

#### [Get Task By Project ID And Task ID](#/openapi?id=get-task-by-project-id-and-task-id)

```
GET /open/v1/project/{projectId}/task/{taskId}  
```

##### [Parameters](#/openapi?id=parameters)

| Type     | Name                     | Description        | Schema |
|----------|--------------------------|--------------------|--------|
| **Path** | **projectId** *required* | Project identifier | string |
| **Path** | **taskId** *required*    | Task identifier    | string |

##### [Responses](#/openapi?id=responses)

| HTTP Code | Description  | Schema                    |
|-----------|--------------|---------------------------|
| **200**   | OK           | [Task](#/openapi?id=task) |
| **401**   | Unauthorized | No Content                |
| **403**   | Forbidden    | No Content                |
| **404**   | Not Found    | No Content                |

##### [Example](#/openapi?id=example)

###### [Request](#/openapi?id=request)

```http
GET /open/v1/project/{{projectId}}/task/{{taskId}} HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response)

```json
{  
"id" : "63b7bebb91c0a5474805fcd4",  
"isAllDay" : true,  
"projectId" : "6226ff9877acee87727f6bca",  
"title" : "Task Title",  
"content" : "Task Content",  
"desc" : "Task Description",  
"timeZone" : "America/Los_Angeles",  
"repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",  
"startDate" : "2019-11-13T03:00:00+0000",  
"dueDate" : "2019-11-14T03:00:00+0000",  
"reminders" : [ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ],  
"tags" : [ "work", "urgent" ],
"priority" : 1,  
"status" : 0,  
"completedTime" : "2019-11-13T03:00:00+0000",  
"sortOrder" : 12345,  
"items" : [ {  
    "id" : "6435074647fd2e6387145f20",  
    "status" : 0,  
    "title" : "Item Title",  
    "sortOrder" : 12345,  
    "startDate" : "2019-11-13T03:00:00+0000",  
    "isAllDay" : false,  
    "timeZone" : "America/Los_Angeles",  
    "completedTime" : "2019-11-13T03:00:00+0000"  
    } ]  
}  
```

#### [Create Task](#/openapi?id=create-task)

```
POST /open/v1/task  
```

##### [Parameters](#/openapi?id=parameters-1)

**Type** **Name** **Description** **Schema** 

**Body** title *required* Task title string 

**Body** projectId *required* Project id string 

**Body** content Task content string 

**Body** desc Description of checklist string 

**Body** isAllDay All day boolean 

**Body** startDate Start date and time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2019-11-13T03:00:00+0000"` date 

**Body** dueDate Due date and time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2019-11-13T03:00:00+0000"` date 

**Body** timeZone The time zone in which the time is specified String 

**Body** reminders Lists of reminders specific to the task list 

**Body** tags Tags of the task list 

**Body** repeatFlag Recurring rules of task string 

**Body** priority The priority of task, default is "0" integer 

**Body** sortOrder The order of task integer 

**Body** items The list of subtasks list 

**Body** items.title Subtask title string 

**Body** items.startDate Start date and time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format date 

**Body** items.isAllDay All day boolean 

**Body** items.sortOrder The order of subtask integer 

**Body** items.timeZone The time zone in which the Start time is specified string 

**Body** items.status The completion status of subtask integer 

**Body** items.completedTime Completed time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2019-11-13T03:00:00+0000"` date

##### [Responses](#/openapi?id=responses-1)

| HTTP Code | Description  | Schema         |
|-----------|--------------|----------------|
| **200**   | OK           | [Task](#/Task) |
| **201**   | Created      | No Content     |
| **401**   | Unauthorized | No Content     |
| **403**   | Forbidden    | No Content     |
| **404**   | Not Found    | No Content     |

##### [Example](#/openapi?id=example-1)

###### [Request](#/openapi?id=request-1)

```http
POST /open/v1/task HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}
{
    ...
    "title":"Task Title",
    "projectId":"6226ff9877acee87727f6bca",
    "tags":["work","urgent"]
    ...
}
```

###### [Response](#/openapi?id=response-1)

```json
{  
"id" : "63b7bebb91c0a5474805fcd4",  
"projectId" : "6226ff9877acee87727f6bca",  
"title" : "Task Title",  
"content" : "Task Content",  
"desc" : "Task Description",  
"isAllDay" : true,  
"startDate" : "2019-11-13T03:00:00+0000",  
"dueDate" : "2019-11-14T03:00:00+0000",  
"timeZone" : "America/Los_Angeles",  
"reminders" : [ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ],  
"tags" : [ "work", "urgent" ],
"repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",  
"priority" : 1,  
"status" : 0,  
"completedTime" : "2019-11-13T03:00:00+0000",  
"sortOrder" : 12345,  
"items" : [ {  
    "id" : "6435074647fd2e6387145f20",  
    "status" : 1,  
    "title" : "Subtask Title",  
    "sortOrder" : 12345,  
    "startDate" : "2019-11-13T03:00:00+0000",  
    "isAllDay" : false,  
    "timeZone" : "America/Los_Angeles",  
    "completedTime" : "2019-11-13T03:00:00+0000"  
    } ]  
}  
```

[]()

#### [Update Task](#/openapi?id=update-task)

```
POST /open/v1/task/{taskId}  
```

##### [Parameters](#/openapi?id=parameters-2)

**Type** **Name** **Description** **Schema** 

**Path** **taskId** *required* Task identifier string 

**Body** id *required* Task id. string 

**Body** projectId *required* Project id. string 

**Body** title Task title string 

**Body** content Task content string 

**Body** desc Description of checklist string 

**Body** isAllDay All day boolean 

**Body** startDate Start date and time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2019-11-13T03:00:00+0000"` date 

**Body** dueDate Due date and time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2019-11-13T03:00:00+0000"` date 

**Body** timeZone The time zone in which the time is specified String 

**Body** reminders Lists of reminders specific to the task list 

**Body** tags Tags of the task list 

**Body** repeatFlag Recurring rules of task string 

**Body** priority The priority of task, default is "normal" integer 

**Body** sortOrder The order of task integer 

**Body** items The list of subtasks list 

**Body** items.title Subtask title string 

**Body** items.startDate Start date and time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format date 

**Body** items.isAllDay All day boolean 

**Body** items.sortOrder The order of subtask integer 

**Body** items.timeZone The time zone in which the Start time is specified string 

**Body** items.status The completion status of subtask integer 

**Body** items.completedTime Completed time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2019-11-13T03:00:00+0000"` date

##### [Responses](#/openapi?id=responses-2)

| HTTP Code | Description  | Schema         |
|-----------|--------------|----------------|
| **200**   | OK           | [Task](#/Task) |
| **201**   | Created      | No Content     |
| **401**   | Unauthorized | No Content     |
| **403**   | Forbidden    | No Content     |
| **404**   | Not Found    | No Content     |

##### [Example](#/openapi?id=example-2)

###### [Request](#/openapi?id=request-2)

```http
POST /open/v1/task/{{taskId}} HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}
{
    "id": "{{taskId}}",
    "projectId": "{{projectId}}",
    "title": "Task Title",
    "priority": 1,
    ...
}
```

###### [Response](#/openapi?id=response-2)

```json
{
"id" : "63b7bebb91c0a5474805fcd4",
"projectId" : "6226ff9877acee87727f6bca",
"title" : "Task Title",
"content" : "Task Content",
"desc" : "Task Description",
"isAllDay" : true,
"startDate" : "2019-11-13T03:00:00+0000",
"dueDate" : "2019-11-14T03:00:00+0000",
"timeZone" : "America/Los_Angeles",
"reminders" : [ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ],
"tags" : [ "work", "urgent" ],
"repeatFlag" : "RRULE:FREQ=DAILY;INTERVAL=1",
"priority" : 1,
"status" : 0,
"completedTime" : "2019-11-13T03:00:00+0000",  
"sortOrder" : 12345,  
"items" : [ {  
    "id" : "6435074647fd2e6387145f20",  
    "status" : 1,  
    "title" : "Item Title",  
    "sortOrder" : 12345,  
    "startDate" : "2019-11-13T03:00:00+0000",  
    "isAllDay" : false,  
    "timeZone" : "America/Los_Angeles",  
    "completedTime" : "2019-11-13T03:00:00+0000"  
    } ], 
"kind": "CHECKLIST"
}  
```

[]()

#### [Complete Task](#/openapi?id=complete-task)

```
POST /open/v1/project/{projectId}/task/{taskId}/complete  
```

##### [Parameters](#/openapi?id=parameters-3)

| Type     | Name                     | Description        | Schema |
|----------|--------------------------|--------------------|--------|
| **Path** | **projectId** *required* | Project identifier | string |
| **Path** | **taskId** *required*    | Task identifier    | string |

##### [Responses](#/openapi?id=responses-3)

| HTTP Code | Description  | Schema     |
|-----------|--------------|------------|
| **200**   | OK           | No Content |
| **201**   | Created      | No Content |
| **401**   | Unauthorized | No Content |
| **403**   | Forbidden    | No Content |
| **404**   | Not Found    | No Content |

##### [Example](#/openapi?id=example-3)

###### [Request](#/openapi?id=request-3)

```http
POST /open/v1/project/{{projectId}}/task/{{taskId}}/complete HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

#### [Delete Task](#/openapi?id=delete-task)

```
DELETE /open/v1/project/{projectId}/task/{taskId}
```

##### [Parameters](#/openapi?id=parameters-4)

| Type     | Name                     | Description        | Schema |
|----------|--------------------------|--------------------|--------|
| **Path** | **projectId** *required* | Project identifier | string |
| **Path** | **taskId** *required*    | Task identifier    | string |

##### [Responses](#/openapi?id=responses-4)

| HTTP Code | Description  | Schema     |
|-----------|--------------|------------|
| **200**   | OK           | No Content |
| **201**   | Created      | No Content |
| **401**   | Unauthorized | No Content |
| **403**   | Forbidden    | No Content |
| **404**   | Not Found    | No Content |

##### [Example](#/openapi?id=example-4)

###### [Request](#/openapi?id=request-4)

```http
DELETE /open/v1/project/{{projectId}}/task/{{taskId}} HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

#### [Move Task](#/openapi?id=move-task)

```
POST /open/v1/task/move
```

Moves one or more tasks between projects.

##### [Request Body](#/openapi?id=request-body)

A JSON array containing task move operations.

| Type     | Name                         | Description                       | Schema |
|----------|------------------------------|-----------------------------------|--------|
| **Body** | **fromProjectId** *required* | The ID of the source project      | string |
| **Body** | **toProjectId** *required*   | The ID of the destination project | string |
| **Body** | **taskId** *required*        | The ID of the task to move        | string |

##### [Responses](#/openapi?id=responses-5)

| HTTP Code | Description  | Schema                                                                    |
|-----------|--------------|---------------------------------------------------------------------------|
| **200**   | OK           | Returns an array of move results, including the task ID and its new etag) |
| **201**   | Created      | No Content                                                                |
| **401**   | Unauthorized | No Content                                                                |
| **403**   | Forbidden    | No Content                                                                |
| **404**   | Not Found    | No Content                                                                |

##### [Example](#/openapi?id=example-5)

###### [Request](#/openapi?id=request-5)

```http
POST /open/v1/task/move HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
[
  {
    "fromProjectId":"69a850ef1c20d2030e148fdd",
    "toProjectId":"69a850f41c20d2030e148fdf",
    "taskId":"69a850f8b9061f374d54a046"
  }
]
```

###### [Response](#/openapi?id=response-3)

```json
[
  {
    "id": "69a850f8b9061f374d54a046",
    "etag": "43p2zso1"
  }
]
```

#### [List Completed Tasks](#/openapi?id=list-completed-tasks)

```
POST /open/v1/task/completed
```

Retrieves a list of tasks marked as completed within specific projects and a given time range.

##### [Request Body](#/openapi?id=request-body-1)

A JSON object containing filter criteria. All fields are optional, but at least one filter is recommended to narrow down results.

| Type     | Name           | Description                                                                            | Schema |
|----------|----------------|----------------------------------------------------------------------------------------|--------|
| **Body** | **projectIds** | List of project identifier                                                             | list   |
| **Body** | **startDate**  | The start of the time range (inclusive). Filters tasks where completedTime ≥ startDate | date   |
| **Body** | **endDate**    | The end of the time range (inclusive). Filters tasks where completedTime ≤ endDate     | date   |

##### [Responses](#/openapi?id=responses-6)

| HTTP Code | Description  | Schema                         |
|-----------|--------------|--------------------------------|
| **200**   | OK           | &lt; [Task](#/Task) &gt; array |
| **201**   | Created      | No Content                     |
| **401**   | Unauthorized | No Content                     |
| **403**   | Forbidden    | No Content                     |
| **404**   | Not Found    | No Content                     |

##### [Example](#/openapi?id=example-6)

###### [Request](#/openapi?id=request-6)

```http
POST /open/v1/task/completed HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
{
  "projectIds": [
    "69a850f41c20d2030e148fdf"
  ],
  "startDate":"2026-03-01T00:58:20.000+0000",
  "endDate":"2026-03-05T10:58:20.000+0000"
}
```

###### [Response](#/openapi?id=response-4)

```json
[
  {
    "id": "69a850f8b9061f374d54a046",
    "projectId": "69a850f41c20d2030e148fdf",
    "sortOrder": -1099511627776,
    "title": "update",
    "content": "",
    "timeZone": "America/Los_Angeles",
    "isAllDay": false,
    "priority": 0,
    "completedTime": "2026-03-04T23:58:20.000+0000",
    "status": 2,
    "etag": "t3kc5m5f",
    "kind": "TEXT"
  }
]
```

#### [Filter Tasks](#/openapi?id=filter-tasks)

```
POST /open/v1/task/filter
```

Retrieves a list of tasks based on advanced filtering criteria, including project scope, date ranges, priority levels, tags, and status.

##### [Parameters](#/openapi?id=parameters-5)

| Type     | Name           | Description                                                                                   | Schema |
|----------|----------------|-----------------------------------------------------------------------------------------------|--------|
| **Body** | **projectIds** | Filters tasks belonging to the specified project ID                                           | list   |
| **Body** | **startDate**  | Filters tasks where the task's startDate ≥ startDate                                          | date   |
| **Body** | **endDate**    | Filters tasks where the task's startDate ≤ endDate                                            | date   |
| **Body** | **proiority**  | Filters tasks by specific priority levels, Valid Values: None(0), Low(1), Mediunm(3), High(5) | list   |
| **Body** | **tag**        | Filters tasks that contain all of the specified tags                                          | list   |
| **Body** | **status**     | Filters tasks by their current status codes (e.g., \[0] for Open, \[2] for Completed)         | list   |

##### [Responses](#/openapi?id=responses-7)

| HTTP Code | Description  | Schema                         |
|-----------|--------------|--------------------------------|
| **200**   | OK           | &lt; [Task](#/Task) &gt; array |
| **201**   | Created      | No Content                     |
| **401**   | Unauthorized | No Content                     |
| **403**   | Forbidden    | No Content                     |
| **404**   | Not Found    | No Content                     |

##### [Example](#/openapi?id=example-7)

###### [Request](#/openapi?id=request-7)

```http
POST /open/v1/task/filter HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
{
  "projectIds": [
    "69a850f41c20d2030e148fdf"
  ],
  "startDate":"2026-03-01T00:58:20.000+0000",
  "endDate":"2026-03-06T10:58:20.000+0000",
  "priority": [0],
  "tag": ["urgent"],
  "status": [0]
}
```

###### [Response](#/openapi?id=response-5)

```json
[
  {
    "id": "69a85785b9061f3c217e9de6",
    "projectId": "69a850f41c20d2030e148fdf",
    "sortOrder": -2199023255552,
    "title": "task1",
    "content": "",
    "desc": "",
    "startDate": "2026-03-05T00:00:00.000+0000",
    "dueDate": "2026-03-05T00:00:00.000+0000",
    "timeZone": "America/Los_Angeles",
    "isAllDay": false,
    "priority": 0,
    "status": 0,
    "tags": [
      "tag"
    ],
    "etag": "cic6e3cg",
    "kind": "TEXT"
  },
  {
    "id": "69a8ea79b9061f4d803f6b32",
    "projectId": "69a850f41c20d2030e148fdf",
    "sortOrder": -3298534883328,
    "title": "task2",
    "content": "",
    "startDate": "2026-03-05T00:00:00.000+0000",
    "dueDate": "2026-03-05T00:00:00.000+0000",
    "timeZone": "America/Los_Angeles",
    "isAllDay": false,
    "priority": 0,
    "status": 0,
    "tags": [
      "tag"
    ],
    "etag": "0nvpcxzh",
    "kind": "TEXT"
  }
]
```

### [Project](#/openapi?id=project)

#### [Get User Project](#/openapi?id=get-user-project)

```
GET /open/v1/project
```

##### [Responses](#/openapi?id=responses-8)

| HTTP Code | Description  | Schema                               |
|-----------|--------------|--------------------------------------|
| **200**   | OK           | &lt; [Project](#/Project) &gt; array |
| **401**   | Unauthorized | No Content                           |
| **403**   | Forbidden    | No Content                           |
| **404**   | Not Found    | No Content                           |

##### [Example](#/openapi?id=example-8)

###### [Request](#/openapi?id=request-8)

```http
GET /open/v1/project HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-6)

```json
[{
"id": "6226ff9877acee87727f6bca",
"name": "project name",
"color": "#F18181",
"closed": false,
"groupId": "6436176a47fd2e05f26ef56e",
"viewMode": "list",
"permission": "write",
"kind": "TASK"
}]
```

#### [Get Project By ID](#/openapi?id=get-project-by-id)

```
GET /open/v1/project/{projectId}
```

##### [Parameters](#/openapi?id=parameters-6)

| Type     | Name                   | Description        | Schema |
|----------|------------------------|--------------------|--------|
| **Path** | **project** *required* | Project identifier | string |

##### [Responses](#/openapi?id=responses-9)

| HTTP Code | Description  | Schema               |
|-----------|--------------|----------------------|
| **200**   | OK           | [Project](#/Project) |
| **401**   | Unauthorized | No Content           |
| **403**   | Forbidden    | No Content           |
| **404**   | Not Found    | No Content           |

##### [Example](#/openapi?id=example-9)

###### [Request path](#/openapi?id=request-path)

```http
GET /open/v1/project/{{projectId}} HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-7)

```json
{
    "id": "6226ff9877acee87727f6bca",
    "name": "project name",
    "color": "#F18181",
    "closed": false,
    "groupId": "6436176a47fd2e05f26ef56e",
    "viewMode": "list",
    "kind": "TASK"
}
```

#### [Get Project With Data](#/openapi?id=get-project-with-data)

```
GET /open/v1/project/{projectId}/data
```

##### [Parameters](#/openapi?id=parameters-7)

| Type     | Name                     | Description        | Schema |
|----------|--------------------------|--------------------|--------|
| **Path** | **projectId** *required* | Project identifier | string |

##### [Responses](#/openapi?id=responses-10)

| HTTP Code | Description  | Schema                       |
|-----------|--------------|------------------------------|
| **200**   | OK           | [ProjectData](#/ProjectData) |
| **401**   | Unauthorized | No Content                   |
| **403**   | Forbidden    | No Content                   |
| **404**   | Not Found    | No Content                   |

##### [Example](#/openapi?id=example-10)

###### [Request](#/openapi?id=request-9)

```http
GET /open/v1/project/{{projectId}}/data HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-8)

```json
{
"project": {
    "id": "6226ff9877acee87727f6bca",
    "name": "project name",
    "color": "#F18181",
    "closed": false,
    "groupId": "6436176a47fd2e05f26ef56e",
    "viewMode": "list",
    "kind": "TASK"
},
"tasks": [{
    "id": "6247ee29630c800f064fd145",
    "isAllDay": true,
    "projectId": "6226ff9877acee87727f6bca",
    "title": "Task Title",
    "content": "Task Content",
    "desc": "Task Description",
    "timeZone": "America/Los_Angeles",
    "repeatFlag": "RRULE:FREQ=DAILY;INTERVAL=1",
    "startDate": "2019-11-13T03:00:00+0000",
    "dueDate": "2019-11-14T03:00:00+0000",
    "reminders": [
        "TRIGGER:P0DT9H0M0S",
        "TRIGGER:PT0S"
    ],
    "priority": 1,
    "status": 0,
    "completedTime": "2019-11-13T03:00:00+0000",
    "sortOrder": 12345,
    "items": [{
        "id": "6435074647fd2e6387145f20",
        "status": 0,
        "title": "Subtask Title",
        "sortOrder": 12345,
        "startDate": "2019-11-13T03:00:00+0000",
        "isAllDay": false,
        "timeZone": "America/Los_Angeles",
        "completedTime": "2019-11-13T03:00:00+0000"
    }]
}],
"columns": [{
    "id": "6226ff9e76e5fc39f2862d1b",
    "projectId": "6226ff9877acee87727f6bca",
    "name": "Column Name",
    "sortOrder": 0
}]
}
```

#### [Create Project](#/openapi?id=create-project)

```
POST /open/v1/project
```

##### [Parameters](#/openapi?id=parameters-8)

| **Type** | **Name**        | **Description**                         | **Schema**      |
|----------|-----------------|-----------------------------------------|-----------------|
| **Body** | name *required* | name of the project                     | string          |
| **Body** | color           | color of project, eg. "#F18181"         | string          |
| **Body** | sortOrder       | sort order value of the project         | integer (int64) |
| **Body** | viewMode        | view mode, "list", "kanban", "timeline" | string          |
| **Body** | kind            | project kind, "TASK", "NOTE"            | string          |

##### [Responses](#/openapi?id=responses-11)

| HTTP Code | Description  | Schema               |
|-----------|--------------|----------------------|
| **200**   | OK           | [Project](#/Project) |
| **201**   | Created      | No Content           |
| **401**   | Unauthorized | No Content           |
| **403**   | Forbidden    | No Content           |
| **404**   | Not Found    | No Content           |

##### [Example](#/openapi?id=example-11)

###### [Request](#/openapi?id=request-10)

```http
POST /open/v1/project HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}
{
    "name": "project name",
    "color": "#F18181",
    "viewMode": "list",
    "kind": "task"
}
```

###### [Response](#/openapi?id=response-9)

```json
{
"id": "6226ff9877acee87727f6bca",
"name": "project name",
"color": "#F18181",
"sortOrder": 0,
"viewMode": "list",
"kind": "TASK"
}
```

#### [Update Project](#/openapi?id=update-project)

```
POST /open/v1/project/{projectId}
```

##### [Parameters](#/openapi?id=parameters-9)

| **Type** | **Parameter**        | **Description**                         | Schema          |
|----------|----------------------|-----------------------------------------|-----------------|
| **Path** | projectId *required* | project identifier                      | string          |
| **Body** | name                 | name of the project                     | string          |
| **Body** | color                | color of the project                    | string          |
| **Body** | sortOrder            | sort order value, default 0             | integer (int64) |
| **Body** | viewMode             | view mode, "list", "kanban", "timeline" | string          |
| **Body** | kind                 | project kind, "TASK", "NOTE"            | string          |

##### [Responses](#/openapi?id=responses-12)

| HTTP Code | Description  | Schema               |
|-----------|--------------|----------------------|
| **200**   | OK           | [Project](#/Project) |
| **201**   | Created      | No Content           |
| **401**   | Unauthorized | No Content           |
| **403**   | Forbidden    | No Content           |
| **404**   | Not Found    | No Content           |

##### [Example](#/openapi?id=example-12)

###### [Request](#/openapi?id=request-11)

```http
POST /open/v1/project/{{projectId}} HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}

{
    "name": "Project Name",
    "color": "#F18181",
    "viewMode": "list",
    "kind": "TASK"
}
```

###### [Response](#/openapi?id=response-10)

```json
{
"id": "6226ff9877acee87727f6bca",
"name": "Project Name",
"color": "#F18181",
"sortOrder": 0,
"viewMode": "list",
"kind": "TASK"
}
```

#### [Delete Project](#/openapi?id=delete-project)

```
DELETE /open/v1/project/{projectId}
```

##### [Parameters](#/openapi?id=parameters-10)

| Type | Name                     | Description        | Schema |
|------|--------------------------|--------------------|--------|
| Path | **projectId** *required* | Project identifier | string |

##### [Responses](#/openapi?id=responses-13)

| HTTP Code | Description  | Schema     |
|-----------|--------------|------------|
| **200**   | OK           | No Content |
| **401**   | Unauthorized | No Content |
| **403**   | Forbidden    | No Content |
| **404**   | Not Found    | No Content |

##### [Example](#/openapi?id=example-13)

###### [Request](#/openapi?id=request-12)

```http
DELETE /open/v1/project/{{projectId}} HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

### [Focus](#/openapi?id=focus)

#### [Get Focus By Focus ID](#/openapi?id=get-focus-by-focus-id)

```
GET /open/v1/focus/{focusId}
```

##### [Parameters](#/openapi?id=parameters-11)

Type Name Description Schema 

**Path** **focusId** *required* Focus identifier string 

**Query** **type** *required* Focus type  
**Value** : Pomodoro: `0`, Timing: `1` integer (int32)

##### [Responses](#/openapi?id=responses-14)

| HTTP Code | Description  | Schema                              |
|-----------|--------------|-------------------------------------|
| **200**   | OK           | [OpenFocus](#/openapi?id=openfocus) |
| **401**   | Unauthorized | No Content                          |
| **403**   | Forbidden    | No Content                          |
| **404**   | Not Found    | No Content                          |

##### [Example](#/openapi?id=example-14)

###### [Request](#/openapi?id=request-13)

```http
GET /open/v1/focus/{{focusId}}?type=0 HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-11)

```json
{
  "id": "focus-1",
  "type": 0,
  "taskId": "task-1",
  "note": "Deep work",
  "status": 2,
  "startTime": "2026-04-07T09:00:00+0800",
  "endTime": "2026-04-07T09:25:00+0800",
  "pauseDuration": 0,
  "adjustTime": 0,
  "added": true,
  "createdTime": "2026-04-07T09:25:00+0800",
  "modifiedTime": "2026-04-07T09:25:00+0800",
  "etimestamp": 1712453100000,
  "etag": "focus-etag",
  "duration": 1500,
  "relationType": [0]
}
```

#### [Get Focuses By Time Range](#/openapi?id=get-focuses-by-time-range)

```
GET /open/v1/focus
```

##### [Parameters](#/openapi?id=parameters-12)

**Type** **Name** **Description** **Schema** 

**Query** **from** *required* Range start time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2026-04-01T00:00:00+0800"` string (date-time) 

**Query** **to** *required* Range end time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2026-04-02T00:00:00+0800"` string (date-time) 

**Query** **type** *required* Focus type  
**Value** : Pomodoro: `0`, Timing: `1` integer (int32)

If the time range exceeds 30 days, the server automatically adjusts the start time to 30 days before `to`.

##### [Responses](#/openapi?id=responses-15)

| HTTP Code | Description  | Schema                                              |
|-----------|--------------|-----------------------------------------------------|
| **200**   | OK           | &lt; [OpenFocus](#/openapi?id=openfocus) &gt; array |
| **401**   | Unauthorized | No Content                                          |
| **403**   | Forbidden    | No Content                                          |
| **404**   | Not Found    | No Content                                          |

##### [Example](#/openapi?id=example-15)

###### [Request](#/openapi?id=request-14)

```http
GET /open/v1/focus?from=2026-04-01T00:00:00+0800&to=2026-04-02T00:00:00+0800&type=1 HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-12)

```json
[
  {
    "id": "focus-1",
    "type": 1,
    "note": "Timing",
    "startTime": "2026-04-01T09:00:00+0800",
    "endTime": "2026-04-01T10:30:00+0800",
    "duration": 5400
  }
]
```

#### [Delete Focus](#/openapi?id=delete-focus)

```
DELETE /open/v1/focus/{focusId}
```

##### [Parameters](#/openapi?id=parameters-13)

**Type** **Name** **Description** **Schema** 

**Path** **focusId** *required* Focus identifier string 

**Query** **type** *required* Focus type  
**Value** : Pomodoro: `0`, Timing: `1` integer (int32)

##### [Responses](#/openapi?id=responses-16)

| HTTP Code | Description  | Schema                              |
|-----------|--------------|-------------------------------------|
| **200**   | OK           | [OpenFocus](#/openapi?id=openfocus) |
| **401**   | Unauthorized | No Content                          |
| **403**   | Forbidden    | No Content                          |
| **404**   | Not Found    | No Content                          |

##### [Example](#/openapi?id=example-16)

###### [Request](#/openapi?id=request-15)

```http
DELETE /open/v1/focus/{{focusId}}?type=0 HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-13)

```json
{
  "id": "focus-1",
  "type": 0
}
```

### [Habit](#/openapi?id=habit)

#### [Get Habit By Habit ID](#/openapi?id=get-habit-by-habit-id)

```
GET /open/v1/habit/{habitId}
```

##### [Parameters](#/openapi?id=parameters-14)

| Type     | Name                   | Description      | Schema |
|----------|------------------------|------------------|--------|
| **Path** | **habitId** *required* | Habit identifier | string |

##### [Responses](#/openapi?id=responses-17)

| HTTP Code | Description  | Schema                              |
|-----------|--------------|-------------------------------------|
| **200**   | OK           | [OpenHabit](#/openapi?id=openhabit) |
| **401**   | Unauthorized | No Content                          |
| **403**   | Forbidden    | No Content                          |
| **404**   | Not Found    | No Content                          |

##### [Example](#/openapi?id=example-17)

###### [Request](#/openapi?id=request-16)

```http
GET /open/v1/habit/{{habitId}} HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-14)

```json
{
  "id": "habit-1",
  "name": "Read",
  "iconRes": "habit_reading",
  "color": "#4D8CF5",
  "sortOrder": 12345,
  "status": 0,
  "encouragement": "Keep going",
  "totalCheckIns": 12,
  "createdTime": "2024-01-01T00:00:00+0000",
  "modifiedTime": "2024-01-08T00:00:00+0000",
  "type": "Boolean",
  "goal": 1.0,
  "step": 1.0,
  "unit": "Count",
  "etag": "habit-etag",
  "repeatRule": "RRULE:FREQ=DAILY;INTERVAL=1",
  "reminders": [],
  "recordEnable": false,
  "sectionId": "section-1",
  "targetDays": 0,
  "targetStartDate": 20240101,
  "completedCycles": 12,
  "exDates": [],
  "style": 0
}
```

#### [Get All Habits](#/openapi?id=get-all-habits)

```
GET /open/v1/habit
```

##### [Parameters](#/openapi?id=parameters-15)

No parameters.

##### [Responses](#/openapi?id=responses-18)

| HTTP Code | Description  | Schema                                              |
|-----------|--------------|-----------------------------------------------------|
| **200**   | OK           | &lt; [OpenHabit](#/openapi?id=openhabit) &gt; array |
| **401**   | Unauthorized | No Content                                          |
| **403**   | Forbidden    | No Content                                          |

##### [Example](#/openapi?id=example-18)

###### [Request](#/openapi?id=request-17)

```http
GET /open/v1/habit HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-15)

```json
[
  {
    "id": "habit-1",
    "name": "Read",
    "repeatRule": "RRULE:FREQ=DAILY;INTERVAL=1",
    "status": 0
  },
  {
    "id": "habit-2",
    "name": "Exercise",
    "repeatRule": "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR",
    "status": 0
  }
]
```

#### [Create Habit](#/openapi?id=create-habit)

```
POST /open/v1/habit
```

##### [Parameters](#/openapi?id=parameters-16)

**Type** **Name** **Description** **Schema** 

**Body** name *required* Habit name. Maximum length is 1000 characters string 

**Body** iconRes Habit icon resource string 

**Body** color Habit color string 

**Body** sortOrder Habit sort order integer (int64) 

**Body** status Habit status integer (int32) 

**Body** encouragement Habit encouragement message string 

**Body** type Habit type string 

**Body** goal Habit goal number (double) 

**Body** step Habit step number (double) 

**Body** unit Habit unit string 

**Body** repeatRule Habit repeat rule  
**Example** : `"RRULE:FREQ=DAILY;INTERVAL=1"` string 

**Body** reminders Habit reminders &lt; string &gt; array 

**Body** recordEnable Whether record is enabled boolean 

**Body** sectionId Habit section identifier string 

**Body** targetDays Target days integer (int32) 

**Body** targetStartDate Target start date in `YYYYMMDD` format  
**Example** : `20240101` integer (int32) 

**Body** completedCycles Completed cycles integer (int32) 

**Body** exDates Excluded dates &lt; string &gt; array 

**Body** style Habit style integer (int32)

##### [Responses](#/openapi?id=responses-19)

| HTTP Code | Description  | Schema                              |
|-----------|--------------|-------------------------------------|
| **200**   | OK           | [OpenHabit](#/openapi?id=openhabit) |
| **201**   | Created      | No Content                          |
| **401**   | Unauthorized | No Content                          |
| **403**   | Forbidden    | No Content                          |
| **404**   | Not Found    | No Content                          |

##### [Example](#/openapi?id=example-19)

###### [Request](#/openapi?id=request-18)

```http
POST /open/v1/habit HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Read",
  "iconRes": "habit_reading",
  "color": "#4D8CF5",
  "type": "Boolean",
  "goal": 1.0,
  "step": 1.0,
  "unit": "Count",
  "repeatRule": "RRULE:FREQ=DAILY;INTERVAL=1",
  "recordEnable": false
}
```

###### [Response](#/openapi?id=response-16)

```json
{
  "id": "habit-1",
  "name": "Read",
  "iconRes": "habit_reading",
  "color": "#4D8CF5",
  "type": "Boolean",
  "goal": 1.0,
  "step": 1.0,
  "unit": "Count",
  "repeatRule": "RRULE:FREQ=DAILY;INTERVAL=1",
  "recordEnable": false
}
```

#### [Update Habit](#/openapi?id=update-habit)

```
POST /open/v1/habit/{habitId}
```

##### [Parameters](#/openapi?id=parameters-17)

**Type** **Name** **Description** **Schema** 

**Path** **habitId** *required* Habit identifier string 

**Body** name Habit name. If empty, it will be treated as null. Maximum length is 1000 characters string 

**Body** iconRes Habit icon resource string 

**Body** color Habit color string 

**Body** sortOrder Habit sort order integer (int64) 

**Body** status Habit status integer (int32) 

**Body** encouragement Habit encouragement message string 

**Body** type Habit type string 

**Body** goal Habit goal number (double) 

**Body** step Habit step number (double) 

**Body** unit Habit unit string 

**Body** repeatRule Habit repeat rule  
**Example** : `"RRULE:FREQ=DAILY;INTERVAL=1"` string 

**Body** reminders Habit reminders &lt; string &gt; array 

**Body** recordEnable Whether record is enabled boolean 

**Body** sectionId Habit section identifier string 

**Body** targetDays Target days integer (int32) 

**Body** targetStartDate Target start date in `YYYYMMDD` format  
**Example** : `20240101` integer (int32) 

**Body** completedCycles Completed cycles integer (int32) 

**Body** exDates Excluded dates &lt; string &gt; array 

**Body** style Habit style integer (int32)

##### [Responses](#/openapi?id=responses-20)

| HTTP Code | Description  | Schema                              |
|-----------|--------------|-------------------------------------|
| **200**   | OK           | [OpenHabit](#/openapi?id=openhabit) |
| **201**   | Created      | No Content                          |
| **401**   | Unauthorized | No Content                          |
| **403**   | Forbidden    | No Content                          |
| **404**   | Not Found    | No Content                          |

##### [Example](#/openapi?id=example-20)

###### [Request](#/openapi?id=request-19)

```http
POST /open/v1/habit/{{habitId}} HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Read more",
  "goal": 2.0,
  "repeatRule": "RRULE:FREQ=DAILY;INTERVAL=1"
}
```

###### [Response](#/openapi?id=response-17)

```json
{
  "id": "habit-1",
  "name": "Read more",
  "goal": 2.0,
  "repeatRule": "RRULE:FREQ=DAILY;INTERVAL=1"
}
```

#### [Create Or Update Habit Check-In](#/openapi?id=create-or-update-habit-check-in)

```
POST /open/v1/habit/{habitId}/checkin
```

##### [Parameters](#/openapi?id=parameters-18)

**Type** **Name** **Description** **Schema** 

**Path** **habitId** *required* Habit identifier string 

**Body** stamp *required* Date stamp in `YYYYMMDD` format  
**Example** : `20260407` integer (int32) 

**Body** time Check-in time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2026-04-07T08:00:00+0000"` string (date-time) 

**Body** opTime Operation time in `"yyyy-MM-dd'T'HH:mm:ssZ"` format  
**Example** : `"2026-04-07T08:00:00+0000"` string (date-time) 

**Body** value Check-in value. Default is `1.0` number (double) 

**Body** goal Check-in goal. Default is `1.0` number (double) 

**Body** status Check-in status integer (int32)

##### [Responses](#/openapi?id=responses-21)

| HTTP Code | Description  | Schema                                            |
|-----------|--------------|---------------------------------------------------|
| **200**   | OK           | [OpenHabitCheckin](#/openapi?id=openhabitcheckin) |
| **201**   | Created      | No Content                                        |
| **401**   | Unauthorized | No Content                                        |
| **403**   | Forbidden    | No Content                                        |
| **404**   | Not Found    | No Content                                        |

##### [Example](#/openapi?id=example-21)

###### [Request](#/openapi?id=request-20)

```http
POST /open/v1/habit/{{habitId}}/checkin HTTP/1.1
Host: api.ticktick.com
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "stamp": 20260407,
  "value": 1.0,
  "goal": 1.0
}
```

###### [Response](#/openapi?id=response-18)

```json
{
  "habitId": "habit-1",
  "year": 2026,
  "checkins": [
    {
      "stamp": 20260407,
      "value": 1.0,
      "goal": 1.0
    }
  ]
}
```

#### [Get Habit Check-Ins](#/openapi?id=get-habit-check-ins)

```
GET /open/v1/habit/checkins
```

##### [Parameters](#/openapi?id=parameters-19)

**Type** **Name** **Description** **Schema** 

**Query** **habitIds** *required* Habit identifiers, separated by commas  
**Example** : `habit-1,habit-2` string 

**Query** **from** *required* Start date stamp in `YYYYMMDD` format  
**Example** : `20260401` integer (int32) 

**Query** **to** *required* End date stamp in `YYYYMMDD` format  
**Example** : `20260407` integer (int32)

##### [Responses](#/openapi?id=responses-22)

| HTTP Code | Description  | Schema                                                            |
|-----------|--------------|-------------------------------------------------------------------|
| **200**   | OK           | &lt; [OpenHabitCheckin](#/openapi?id=openhabitcheckin) &gt; array |
| **401**   | Unauthorized | No Content                                                        |
| **403**   | Forbidden    | No Content                                                        |
| **404**   | Not Found    | No Content                                                        |

##### [Example](#/openapi?id=example-22)

###### [Request](#/openapi?id=request-21)

```http
GET /open/v1/habit/checkins?habitIds=habit-1,habit-2&from=20260401&to=20260407 HTTP/1.1
Host: api.ticktick.com
Authorization: Bearer {{token}}
```

###### [Response](#/openapi?id=response-19)

```json
[
  {
    "habitId": "habit-1",
    "year": 2026,
    "checkins": [
      {
        "stamp": 20260407,
        "value": 1.0,
        "goal": 1.0
      }
    ]
  }
]
```

## [Definitions](#/openapi?id=definitions)

### [ChecklistItem](#/openapi?id=checklistitem)

Name Description Schema 

**id** Subtask identifier string 

**title** Subtask title string 

**status** The completion status of subtask  
**Value** : Normal: `0`, Completed: `1` integer (int32) 

**completedTime** Subtask completed time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2019-11-13T03:00:00+0000"` string (date-time) 

**isAllDay** All day boolean 

**sortOrder** Subtask sort order  
**Example** : `234444` integer (int64) 

**startDate** Subtask start date time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2019-11-13T03:00:00+0000"` string (date-time) 

**timeZone** Subtask timezone  
**Example** : `"America/Los_Angeles"` string

### [Task](#/openapi?id=task-1)

Name Description Schema 

**id** Task identifier string 

**projectId** Task project id string 

**title** Task title string 

**isAllDay** All day boolean 

**completedTime** Task completed time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2019-11-13T03:00:00+0000"` string (date-time) 

**content** Task content string 

**desc** Task description of checklist string 

**dueDate** Task due date time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2019-11-13T03:00:00+0000"` string (date-time) 

**items** Subtasks of Task &lt; [ChecklistItem](#/openapi?id=checklistitem) &gt; array 

**priority** Task priority  
**Value** : None:`0`, Low:`1`, Medium:`3`, High`5` integer (int32) 

**reminders** List of reminder triggers  
**Example** : `[ "TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S" ]` &lt; string &gt; array 

**tags** Task tags  
**Example** : `[ "work", "urgent" ]` &lt; string &gt; array 

**repeatFlag** Recurring rules of task  
**Example** : `"RRULE:FREQ=DAILY;INTERVAL=1"` string 

**sortOrder** Task sort order  
**Example** : `12345` integer (int64) 

**startDate** Start date time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2019-11-13T03:00:00+0000"` string (date-time) 

**status** Task completion status  
**Value** : Normal: `0`, Completed: `2` integer (int32) 

**timeZone** Task timezone  
**Example** : `"America/Los_Angeles"` string 

**kind** "TEXT", "NOTE", "CHECKLIST" string

### [Project](#/openapi?id=project-1)

| Name           | Description                             | Schema          |
|----------------|-----------------------------------------|-----------------|
| **id**         | Project identifier                      | string          |
| **name**       | Project name                            | string          |
| **color**      | Project color                           | string          |
| **sortOrder**  | Order value                             | integer (int64) |
| **closed**     | Projcet closed                          | boolean         |
| **groupId**    | Project group identifier                | string          |
| **viewMode**   | view mode, "list", "kanban", "timeline" | string          |
| **permission** | "read", "write" or "comment"            | string          |
| **kind**       | "TASK" or "NOTE"                        | string          |

### [Column](#/openapi?id=column)

| Name      | Description        | Schema          |
|-----------|--------------------|-----------------|
| id        | Column identifier  | string          |
| projectId | Project identifier | string          |
| name      | Column name        | string          |
| sortOrder | Order value        | integer (int64) |

### [ProjectData](#/openapi?id=projectdata)

| Name    | Description                | Schema                           |
|---------|----------------------------|----------------------------------|
| project | Project info               | [Project](#/Project)             |
| tasks   | Undone tasks under project | &lt;[Task](#/Task)&gt; array     |
| columns | Columns under project      | &lt;[Column](#/Column)&gt; array |

### [OpenPomodoroTaskBrief](#/openapi?id=openpomodorotaskbrief)

Name Description Schema 

**taskId** Task id string 

**title** Task title string 

**habitId** Habit id string 

**timerId** Timer id string 

**timerName** Timer name string 

**startTime** Task focus start time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T09:00:00+0800"` string (date-time) 

**endTime** Task focus end time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T09:25:00+0800"` string (date-time)

### [OpenFocus](#/openapi?id=openfocus)

Name Description Schema 

**id** Focus unique id string 

**userId** User id integer (int64) 

**type** Focus type  
**Value** : Pomodoro: `0`, Timing: `1` integer (int32) 

**taskId** Task id string 

**note** Focus note string 

**tasks** Related task briefs &lt; [OpenPomodoroTaskBrief](#/openapi?id=openpomodorotaskbrief) &gt; array 

**status** Pomodoro status integer (int32) 

**startTime** Focus start time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T09:00:00+0800"` string (date-time) 

**endTime** Focus end time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T09:25:00+0800"` string (date-time) 

**pauseDuration** Pause duration in seconds integer (int32) 

**adjustTime** Adjusted time in seconds integer (int64) 

**added** Whether record was added boolean 

**createdTime** Created time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T09:25:00+0800"` string (date-time) 

**modifiedTime** Modified time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T09:25:00+0800"` string (date-time) 

**etimestamp** Entity timestamp integer (int64) 

**etag** Entity tag string 

**duration** Focus duration integer (int64) 

**relationType** Relation types &lt; integer &gt; array

### [OpenHabit](#/openapi?id=openhabit)

Name Description Schema 

**id** Habit unique id string 

**name** Habit name string 

**iconRes** Habit icon resource string 

**color** Habit color string 

**sortOrder** Habit sort order integer (int64) 

**status** Habit status integer (int32) 

**encouragement** Habit encouragement message string 

**totalCheckIns** Total check-ins integer (int32) 

**createdTime** Created time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2024-01-01T00:00:00+0000"` string (date-time) 

**modifiedTime** Modified time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2024-01-08T00:00:00+0000"` string (date-time) 

**archivedTime** Archived time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2024-01-08T00:00:00+0000"` string (date-time) 

**type** Habit type string 

**goal** Habit goal number (double) 

**step** Habit step number (double) 

**unit** Habit unit string 

**etag** Habit etag string 

**repeatRule** Habit repeat rule  
**Example** : `"RRULE:FREQ=DAILY;INTERVAL=1"` string 

**reminders** Habit reminders &lt; string &gt; array 

**recordEnable** Whether record is enabled boolean 

**sectionId** Habit section identifier string 

**targetDays** Target days integer (int32) 

**targetStartDate** Target start date in `YYYYMMDD` format  
**Example** : `20240101` integer (int32) 

**completedCycles** Completed cycles integer (int32) 

**exDates** Excluded dates &lt; string &gt; array 

**style** Habit style integer (int32)

### [OpenHabitCheckinData](#/openapi?id=openhabitcheckindata)

Name Description Schema 

**id** Check-in id string 

**stamp** Date stamp in `YYYYMMDD` format  
**Example** : `20260407` integer (int32) 

**time** Check-in time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T08:00:00+0000"` string (date-time) 

**opTime** Operation time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T08:00:00+0000"` string (date-time) 

**value** Check-in value. Default is `1.0` number (double) 

**goal** Check-in goal. Default is `1.0` number (double) 

**status** Check-in status integer (int32)

### [OpenHabitCheckin](#/openapi?id=openhabitcheckin)

Name Description Schema 

**id** Check-in document id string 

**habitId** Habit id string 

**createdTime** Created time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T08:00:00+0000"` string (date-time) 

**modifiedTime** Modified time in `"yyyy-MM-dd'T'HH:mm:ssZ"`  
**Example** : `"2026-04-07T08:00:00+0000"` string (date-time) 

**etag** Check-in etag string 

**year** Year integer (int32) 

**checkins** Check-in entries &lt; [OpenHabitCheckinData](#/openapi?id=openhabitcheckindata) &gt; array

## [Feedback and Support](#/openapi?id=feedback-and-support)

If you have any questions or feedback regarding the TickTick Open API documentation, please contact us at [support@ticktick.com](mailto:support@ticktick.com). We appreciate your input and will work to address any concerns or issues as quickly as possible. Thank you for choosing TickTick!
