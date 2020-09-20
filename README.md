**Overview** 
* An app to display list of servers and tasks where a user can add upto 10 servers and N number of tasks.
* Atleast 1 server is always running. Every servers is listening for tasks. As soon as it finds a tasks, executes a task it which takes 20s.
* If all servers are busy, tasks will be queued and as soon as a servers is avaialable it picks up the queued task to execute.
* User can deleted a server but if a server is busy, it'll be deleted once it completes the execution
* User can only delete a task if it isn't being executed.
* This is only UI that is mimicking the server/client relationship

**Tech Stack**

HTML,CSS and JavaScript

**Demo**  
Deployed at https://task-manager-nikita.herokuapp.com/
