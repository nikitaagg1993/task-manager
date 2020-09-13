// to maintain list of all servers
const serverInfo = {};

//list of servers that were requested to remove
const removeRequested = [];

// queue of all the pending tasks
const queuedTasks = [];

//list of all the tasks
const tasks = {};

// list of deleted server
const deletedServer = [];

let totalTasks = 0;

function deleteTask (task) {

    delete tasks[task];
    const qtaskIndex = queuedTasks.findIndex((item) => item == task);
    queuedTasks.splice(qtaskIndex,1);

    const element =document.getElementById(`top-${task}`);
    element.remove();
}

function createDeleteIcon(id){
    const iconElement = document.createElement("i");
    iconElement.className = "fa fa-trash fa-3x iconCol";
    iconElement.id = `icon-${id}`;
    iconElement.name = id;
    iconElement.addEventListener('click', function(e) {
        deleteTask(e.target.name)
    });

    return iconElement;
}

function removeDeleteIcon(id){
    const iconElement = document.getElementById(`icon-${id}`);
    if(iconElement) iconElement.remove();
}

function createNewElement ({elementType, className, id, text, type, value, name}) {
    const newElement = document.createElement(elementType);
    if(className) newElement.className = className;
    if(id) newElement.id = id;
    if(text)  {
        newElement.className = className;
        const node = document.createTextNode(text);
        newElement.appendChild(node);
    }
    if(type) newElement.type = type;
    if(value) newElement.value = value;
    if(name) newElement.name = name;
    return newElement;
}

function showError(error, id) {
    const parentElement1 = document.getElementById("errors");
    if(document.getElementById(id)) return;
    const errorElement = createNewElement({
        className: 'error',
        elementType: 'div',
        id:  id || 'error',
        text: error
    });
    parentElement1.appendChild(errorElement)
}


function addServerToThelist(serverId, serverName) {
    const element = document.getElementById("server");
    
    const divElem  = createNewElement({ elementType: 'div',className: 'serverName', id: serverId });
    const labelElem  = createNewElement({ elementType: 'label', id: serverId, text: serverName });
    const radioButtonElem = createNewElement({
        elementType: 'input',
        id: serverId,
        name: 'Servers',
        type: 'radio',
        value: serverId 
    });
    divElem.appendChild(radioButtonElem);
    divElem.appendChild(labelElem);
    element.appendChild(divElem);
}

function addTaskToThelist(taskName, id) {

    const topDiv = createNewElement({ elementType: 'div', className: 'topTaskDiv', id: `top-${id}`})

    const mainDiv = createNewElement({
        className: 'serverName',
        elementType: 'div',
        id:`${id}-text`,
        text: `${taskName} | Status: Queued`
    });
    
    const taskBar = createNewElement({elementType: 'div', id: `taskbar-${id}`, className: 'taskBar'});
    const div = createNewElement({ className: 'myProgress', elementType: 'div' });
    const bar = createNewElement({
        className: 'myBar',
        elementType: 'div',
        id: taskName,
        text: "00:20",
    })

    div.appendChild(bar);
    const element = document.getElementById("tasks");
    const icon = createDeleteIcon(id);
    taskBar.appendChild(div);
    taskBar.appendChild(icon);

    const br = document.createElement("BR");
    
    topDiv.appendChild(mainDiv);
    topDiv.appendChild(taskBar);
    topDiv.appendChild(br);
    element.appendChild(topDiv);
}

function startServer (name,id) {
    let intervalId;
    serverInfo[id] = {
        serverName: name,
        available: true 
    };
    addServerToThelist(id, name);
    let width = 5;
    let time = 20;
    let task;
    let i =1;
    (function(id){
        intervalId = setInterval(() => {

            if(serverInfo[id].available && queuedTasks.length) {
                serverInfo[id].available = false;
                const currentTask = queuedTasks.shift();
                task = currentTask;

                startTask(currentTask, name, id);
                width = 5;
                time = 20;
                i=1;
            } 

            if(!serverInfo[id].available && task && i<=20) {

                const elem = document.getElementById(tasks[task].name);

                if (width >= 100 && !queuedTasks.includes(task)) {

                elem.style.width = `${width}%`;
                elem.innerHTML = `completed`;

                serverInfo[id].available = true;
                const divEl = document.getElementById(`${task}-text`);
                divEl.textContent = `${tasks[task].name} | Status: Completed | Server Allocated : ${serverInfo[id].serverName}`;

                } else if(width < 100) {
                    width +=5 ;
                    time--;
                    const timeString = time >= 10 ? time: `0${time}`;
                    elem.style.width = width + "%";
                    elem.innerHTML = `00:${timeString}`;
                }
                i++;
            }
        },1000)
    }(id));
    serverInfo[id].intervalId = intervalId;

} 

window.onload = function() {
    if(Object.keys(serverInfo).length === 0) {    
        startServer('Server 1', 'server1')
    }
  };

function addServer () {

    const serverCount = Object.keys(serverInfo).length + 1;

    if(serverCount > 10) {
        showError("Cannot add more than 10 servers", 'serverError')
        return;
    }

    const useDeletedName = deletedServer.length;
    // if we have deleted a server, use that name to create anew one
    const serverName = useDeletedName ? deletedServer.pop() : `server${serverCount}`;
    
    const serverNumber = useDeletedName ? serverName.replace("server", "") : serverCount;

    const text = `Server ${serverNumber}`;

    startServer(text, serverName);
}


function deleteServer (server) {

    clearInterval(serverInfo[server].intervalId);
    deletedServer.push(server);

    const findRemoveIndex = removeRequested.findIndex(item => item === server);
    removeRequested.splice(findRemoveIndex,1)

    var element = document.getElementById(server);
    element.remove();
    delete serverInfo[server];
    return;
}

function removeServer () {
    const selected = document.querySelector('input[name="Servers"]:checked');

    if(!selected) {
        showError("Please select a server", "serverNotSelected");
        return;
    }

    if(Object.keys(serverInfo).length === 1) {
        showError("Can't delete last server", "lastServer");
        return;
    }

    const server = selected.value;
    removeRequested.push(server);

    if(serverInfo[server].available) {  
        deleteServer(server);
        return;
    }

    showError("Can't delete! Server is busy.", "removeError");

    const intervalId = setInterval(()=> {
        if(serverInfo[server].available) {
            deleteServer(server);
            const element = document.getElementById("removeError");
            element.remove();
            clearInterval(intervalId);
        }
    },1000)
}

function startTask(currentTask, serverName, serverId) {
        
    const divEl = document.getElementById(`${currentTask}-text`);
    divEl.textContent = ` ${tasks[currentTask].name} | Status: In Progress | Server Allocated : ${serverName}`;
    removeDeleteIcon(currentTask);
}

function addTask () {
    const taskCount = document.getElementById("taskQuantity").value;
    for(let i=0; i<taskCount; i++){
        totalTasks ++;
        const name = `Task ${totalTasks}`;
        const id = `task${totalTasks}`
        tasks[id] = {
            name,
            id,
            completed: false
        };
        queuedTasks.push(`task${totalTasks}`);        
        addTaskToThelist(name, id, tasks);
    }
}
