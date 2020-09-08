const servers = ['server1']
let serverCount = 1;
const availableServers = ['server1'];
const queuedTasks = [];

const tasks = [];

const deletedServer = [];


function deleteTask (task) {
    const taskIndex = tasks.findIndex((item) => item.id == task);
    tasks.splice(taskIndex,1);
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


function addServerToThelist(serverName,serverId, isError) {
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
        text: `Task: ${taskName} | Status: Queued`
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

window.onload = function() {
    if(servers.length === 1) {
        addServerToThelist('Server 1', 'server1');
    }
  };
function addServer () {

    if(serverCount > 9) {
        showError("Cannot add more than 10 servers", 'serverError')
        return;
    }

    const useDeletedName = deletedServer.length;

    const serverName = useDeletedName ? deletedServer.pop() : `server${serverCount+1}`;
    
    serverCount++;

    // servers[serverName] = {
    //     name: serverName,
    //     isAvailable: true,
    // };
    servers.push(serverName);
    availableServers.push(serverName);
    const serverNumber = useDeletedName ? serverName.replace("server", "") : serverCount;

    const text = `Server ${serverNumber}`;
    addServerToThelist(text,serverName);

    if(queuedTasks.length) {
        const intId = setInterval(()=> {
            if(availableServers.length) { 
                startTask();
                clearInterval(intId);
            }
        }, 3000)
    }

}


function deleteServer (server) {
    const findServerIndex = servers.findIndex(item => item === server);
    servers.splice(findServerIndex,1)

    deletedServer.push(server);
    const index = availableServers.find(item => item === server);
    availableServers.splice(index,1);
    serverCount--;
    var element = document.getElementById(server);
    element.remove();
    return;
}

function removeServer () {
    const selected = document.querySelector('input[name="Servers"]:checked');

    if(!selected) {
        showError("Please select a server", "serverNotSelected");
        return;
    }

    if(servers.length === 1) {
        showError("Can't delete last server", "lastServer");
        return;
    }

    const server = selected.value;

    if(availableServers.includes(server)) {  
        deleteServer(server);
        return;
    }

    showError("Can't delete! Server is busy.", "removeError");

    const intervalId = setInterval(()=> {
        if(availableServers.includes(server)) {
            deleteServer(server);
            const element = document.getElementById("removeError");
            element.remove();
            clearInterval(intervalId);
        }
    },1000)
}

function progressBar (task, currentTask, currentServerName) {
    let i = 0;
    if (i == 0) {
        i = 1;

        const elem = document.getElementById(task.name);

        let width = 5;
        let time = 20;
        const id = setInterval(frame, 1000);
        function frame() {

          if (width >= 100 && !queuedTasks.includes(task)) {

            elem.style.width = `${width}%`;
            elem.innerHTML = `completed`;


            const divEl = document.getElementById(`${currentTask}-text`);
            divEl.textContent = `${task.name} | Status: Completed | Server Allocated : ${currentServerName}`;
            
            clearInterval(id);

            i = 0;
          } else if(width < 100) {
                width +=5 ;
                time--;
                const timeString = time >= 10 ? time: `0${time}`;
                elem.style.width = width + "%";
                elem.innerHTML = `00:${timeString}`;
            }
      }
    }
}

function startTask() {
    const newAvailableServer = [...availableServers];

    for (const i in newAvailableServer) {
        if(!queuedTasks.length) return;

        const currentServer = availableServers.shift();
        const currentTask = queuedTasks.shift();
        const taskIndex = parseInt(currentTask.replace("task","")) - 1;

        tasks[taskIndex].server = currentServer;
        const divEl = document.getElementById(`${currentTask}-text`);

        const serverName = `Server ${currentServer.replace("server","")}`;

        divEl.textContent = `Task ${taskIndex+1} | Status: In Progress | Server Allocated : ${serverName}`;
        progressBar(tasks[taskIndex], currentTask, serverName);
        removeDeleteIcon(currentTask);

        (function(serverSelected, taskSelected){
            setTimeout(() => {
                availableServers.push(serverSelected);
            },20000);
        }(currentServer,currentTask));
    };
}

function addTask () {
    let prevTaskCount = tasks.length;
    const taskCount = document.getElementById("taskQuantity").value;
    for(let i=0; i<taskCount; i++){
        const name = `Task ${prevTaskCount + i + 1}`;
        const id = `task${prevTaskCount + i + 1}`
        tasks.push({
            name,
            id,
            completed: false
        })
        queuedTasks.push(`task${prevTaskCount + i + 1}`);
        addTaskToThelist(name, id, tasks);
        
    }

    startTask(prevTaskCount);
    prevTaskCount++;

    if(queuedTasks.length) {
        const intId = setInterval(()=> {
            if(availableServers.length) { 
                startTask(prevTaskCount);
                clearInterval(intId);
            }
        }, 3000)
    }
}
