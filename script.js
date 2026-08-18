/* =========================================================
   DOM ELEMENTS
========================================================= */

const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");

const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");

const filters = document.querySelectorAll(".filter");

const clearCompletedBtn =
    document.getElementById("clearCompleted");


/* =========================================================
   STATISTICS
========================================================= */

const totalTasks =
    document.getElementById("totalTasks");

const completedTasks =
    document.getElementById("completedTasks");

const remainingTasks =
    document.getElementById("remainingTasks");

const progressPercentage =
    document.getElementById("progressPercentage");

const taskCount =
    document.getElementById("taskCount");


/* =========================================================
   EDIT MODAL
========================================================= */

const editModal =
    document.getElementById("editModal");

const editTaskInput =
    document.getElementById("editTaskInput");

const editCategoryInput =
    document.getElementById("editCategoryInput");

const editPriorityInput =
    document.getElementById("editPriorityInput");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const saveEdit =
    document.getElementById("saveEdit");


/* =========================================================
   DATA
========================================================= */

let tasks =
    JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

let editingTaskId = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    renderTasks();

    updateAnalytics();

});


/* =========================================================
   ADD TASK
========================================================= */

addTaskBtn.addEventListener(
    "click",
    addTask
);


taskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


function addTask() {

    const title =
        taskInput.value.trim();


    if (title === "") {

        alert("Please enter a task.");

        return;

    }


    const task = {

        id: Date.now(),

        title: title,

        description: "No description added",

        category:
            categoryInput.value || "personal",

        priority:
            priorityInput.value || "medium",

        date:
            dateInput.value || "",

        completed: false

    };


    tasks.push(task);


    saveTasks();

    renderTasks();


    taskInput.value = "";

    categoryInput.value = "";

    priorityInput.value = "";

    dateInput.value = "";


    taskInput.focus();

}


/* =========================================================
   SAVE TASKS
========================================================= */

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


/* =========================================================
   RENDER TASKS
========================================================= */

function renderTasks() {

    taskList.innerHTML = "";


    let filteredTasks =
        tasks.filter(function (task) {


            if (
                currentFilter === "active" &&
                task.completed
            ) {

                return false;

            }


            if (
                currentFilter === "completed" &&
                !task.completed
            ) {

                return false;

            }


            const searchText =
                searchInput.value
                    .toLowerCase()
                    .trim();


            if (searchText !== "") {

                return task.title
                    .toLowerCase()
                    .includes(searchText);

            }


            return true;

        });


    if (filteredTasks.length === 0) {

        emptyState.style.display =
            "block";

    } else {

        emptyState.style.display =
            "none";

    }


    filteredTasks.forEach(
        function (task) {

            createTaskElement(task);

        }
    );


    updateStatistics();

    updateAnalytics();

}


/* =========================================================
   CREATE TASK ELEMENT
========================================================= */

function createTaskElement(task) {

    const taskElement =
        document.createElement("div");


    taskElement.classList.add("task");


    if (task.completed) {

        taskElement.classList.add(
            "completed"
        );

    }


    taskElement.dataset.id =
        task.id;


    const categoryName =
        capitalize(task.category);


    const priorityName =
        capitalize(task.priority);


    let dateText =
        "No date";


    if (task.completed) {

        dateText =
            "✓ Completed";

    }

    else if (task.date) {

        dateText =
            "📅 " + formatDate(task.date);

    }


    taskElement.innerHTML = `

        <div class="task-check">

            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? "checked" : ""}
            >

        </div>


        <div class="task-content">

            <h4>
                ${escapeHTML(task.title)}
            </h4>

            <p>
                ${escapeHTML(task.description)}
            </p>


            <div class="task-meta">

                <span
                    class="category-tag ${task.category}"
                >
                    ${categoryName}
                </span>


                ${
                    !task.completed
                    ?
                    `
                    <span
                        class="priority ${task.priority}"
                    >
                        ${priorityName} Priority
                    </span>
                    `
                    :
                    ""
                }


                <span class="task-date">
                    ${dateText}
                </span>

            </div>

        </div>


        <div class="task-actions">

            <button
                class="edit-btn"
                title="Edit Task"
            >
                ✏️
            </button>


            <button
                class="delete-btn"
                title="Delete Task"
            >
                🗑️
            </button>

        </div>

    `;


    /* =====================================================
       CHECKBOX
    ===================================================== */

    const checkbox =
        taskElement.querySelector(
            ".task-checkbox"
        );


    checkbox.addEventListener(
        "change",
        function () {

            toggleTask(task.id);

        }
    );


    /* =====================================================
       EDIT BUTTON
    ===================================================== */

    const editButton =
        taskElement.querySelector(
            ".edit-btn"
        );


    editButton.addEventListener(
        "click",
        function () {

            openEditModal(task.id);

        }
    );


    /* =====================================================
       DELETE BUTTON
    ===================================================== */

    const deleteButton =
        taskElement.querySelector(
            ".delete-btn"
        );


    deleteButton.addEventListener(
        "click",
        function () {

            deleteTask(task.id);

        }
    );


    taskList.appendChild(
        taskElement
    );

}


/* =========================================================
   TOGGLE TASK
========================================================= */

function toggleTask(id) {

    tasks =
        tasks.map(
            function (task) {

                if (task.id === id) {

                    return {

                        ...task,

                        completed:
                            !task.completed

                    };

                }


                return task;

            }
        );


    saveTasks();

    renderTasks();

}


/* =========================================================
   DELETE TASK
========================================================= */

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {

        return;

    }


    tasks =
        tasks.filter(
            function (task) {

                return task.id !== id;

            }
        );


    saveTasks();

    renderTasks();

}


/* =========================================================
   EDIT TASK
========================================================= */

function openEditModal(id) {

    const task =
        tasks.find(
            function (task) {

                return task.id === id;

            }
        );


    if (!task) {

        return;

    }


    editingTaskId = id;


    editTaskInput.value =
        task.title;

    editCategoryInput.value =
        task.category;

    editPriorityInput.value =
        task.priority;


    editModal.style.display =
        "flex";

}


/* =========================================================
   SAVE EDIT
========================================================= */

saveEdit.addEventListener(
    "click",
    function () {

        const newTitle =
            editTaskInput.value.trim();


        if (newTitle === "") {

            alert(
                "Task name cannot be empty."
            );

            return;

        }


        tasks =
            tasks.map(
                function (task) {

                    if (
                        task.id ===
                        editingTaskId
                    ) {

                        return {

                            ...task,

                            title:
                                newTitle,

                            category:
                                editCategoryInput.value,

                            priority:
                                editPriorityInput.value

                        };

                    }


                    return task;

                }
            );


        saveTasks();

        renderTasks();

        closeEditModal();

    }
);


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


function closeEditModal() {

    editModal.style.display =
        "none";

    editingTaskId = null;

}


editModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            editModal
        ) {

            closeEditModal();

        }

    }
);


/* =========================================================
   FILTERS
========================================================= */

filters.forEach(
    function (filterButton) {

        filterButton.addEventListener(
            "click",
            function () {


                filters.forEach(
                    function (button) {

                        button.classList
                            .remove("active");

                    }
                );


                filterButton.classList.add(
                    "active"
                );


                currentFilter =
                    filterButton.dataset.filter;


                renderTasks();

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    function () {

        renderTasks();

    }
);


/* =========================================================
   CLEAR COMPLETED
========================================================= */

clearCompletedBtn.addEventListener(
    "click",
    function () {

        const completedExist =
            tasks.some(
                function (task) {

                    return task.completed;

                }
            );


        if (!completedExist) {

            alert(
                "There are no completed tasks."
            );

            return;

        }


        const confirmClear =
            confirm(
                "Delete all completed tasks?"
            );


        if (!confirmClear) {

            return;

        }


        tasks =
            tasks.filter(
                function (task) {

                    return !task.completed;

                }
            );


        saveTasks();

        renderTasks();

    }
);


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const remaining =
        total - completed;


    let progress = 0;


    if (total > 0) {

        progress =
            Math.round(
                (completed / total) * 100
            );

    }


    totalTasks.textContent =
        total;


    completedTasks.textContent =
        completed;


    remainingTasks.textContent =
        remaining;


    progressPercentage.textContent =
        progress + "%";


    taskCount.textContent =
        remaining;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {

    const date =
        new Date(dateString);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalize(text) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/* =========================================================
   HEADER ADD TASK BUTTON
========================================================= */

const headerAddButton =
    document.querySelector(
        ".add-task-btn"
    );


if (headerAddButton) {

    headerAddButton.addEventListener(
        "click",
        function () {

            taskInput.focus();


            taskInput.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }
    );

}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

const navItems =
    document.querySelectorAll(
        ".navigation .nav-item"
    );


navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                navItems.forEach(
                    function (nav) {

                        nav.classList
                            .remove("active");

                    }
                );


                item.classList.add(
                    "active"
                );


                const text =
                    item.querySelector(
                        "span:nth-child(2)"
                    )?.textContent;


                if (
                    text === "All Tasks"
                ) {

                    currentFilter =
                        "all";

                }


                else if (
                    text === "Completed"
                ) {

                    currentFilter =
                        "completed";

                }


                else if (
                    text === "Today"
                ) {

                    showTodayTasks();

                    return;

                }


                else if (
                    text === "Upcoming"
                ) {

                    showUpcomingTasks();

                    return;

                }


                updateFilterButtons();

                renderTasks();

            }
        );

    }
);


/* =========================================================
   UPDATE FILTER BUTTONS
========================================================= */

function updateFilterButtons() {

    filters.forEach(
        function (button) {

            button.classList
                .remove("active");


            if (
                button.dataset.filter ===
                currentFilter
            ) {

                button.classList
                    .add("active");

            }

        }
    );

}


/* =========================================================
   TODAY TASKS
========================================================= */

function showTodayTasks() {

    taskList.innerHTML = "";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayTasks =
        tasks.filter(
            function (task) {

                return task.date === today;

            }
        );


    if (
        todayTasks.length === 0
    ) {

        emptyState.style.display =
            "block";

    }

    else {

        emptyState.style.display =
            "none";

    }


    todayTasks.forEach(
        function (task) {

            createTaskElement(task);

        }
    );

}


/* =========================================================
   UPCOMING TASKS
========================================================= */

function showUpcomingTasks() {

    taskList.innerHTML = "";


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const upcomingTasks =
        tasks.filter(
            function (task) {

                return (
                    task.date &&
                    task.date > today
                );

            }
        );


    if (
        upcomingTasks.length === 0
    ) {

        emptyState.style.display =
            "block";

    }

    else {

        emptyState.style.display =
            "none";

    }


    upcomingTasks.forEach(
        function (task) {

            createTaskElement(task);

        }
    );

}


/* =========================================================
   CATEGORY NAVIGATION
========================================================= */

const categoryItems =
    document.querySelectorAll(
        ".categories .nav-item"
    );


categoryItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const category =
                    item.querySelector(
                        "span:nth-child(2)"
                    )
                    ?.textContent
                    .toLowerCase();


                const categoryTasks =
                    tasks.filter(
                        function (task) {

                            return (
                                task.category ===
                                category
                            );

                        }
                    );


                taskList.innerHTML =
                    "";


                if (
                    categoryTasks.length === 0
                ) {

                    emptyState.style.display =
                        "block";

                }

                else {

                    emptyState.style.display =
                        "none";

                }


                categoryTasks.forEach(
                    function (task) {

                        createTaskElement(task);

                    }
                );

            }
        );

    }
);


/* =========================================================
   WEEKLY TASK ANALYTICS
========================================================= */

function updateAnalytics() {

    const weeklyBars =
        document.getElementById(
            "weeklyBars"
        );


    const weekDays =
        document.getElementById(
            "weekDays"
        );


    if (
        !weeklyBars ||
        !weekDays
    ) {

        return;

    }


    weeklyBars.innerHTML =
        "";


    weekDays.innerHTML =
        "";


    /* =====================================================
       GET CURRENT WEEK
    ===================================================== */

    const today =
        new Date();


    const currentDay =
        today.getDay();


    const monday =
        new Date(today);


    const difference =
        currentDay === 0
            ? -6
            : 1 - currentDay;


    monday.setDate(
        today.getDate() +
        difference
    );


    monday.setHours(
        0,
        0,
        0,
        0
    );


    /* =====================================================
       CREATE MONDAY - SUNDAY
    ===================================================== */

    const days = [];


    const dayNames = [

        "Mon",

        "Tue",

        "Wed",

        "Thu",

        "Fri",

        "Sat",

        "Sun"

    ];


    for (
        let i = 0;
        i < 7;
        i++
    ) {

        const date =
            new Date(monday);


        date.setDate(
            monday.getDate() +
            i
        );


        days.push({

            date: date,

            name: dayNames[i]

        });

    }


    /* =====================================================
       CREATE DATA FOR EACH DAY
    ===================================================== */

    const weeklyData =
        days.map(
            function (day) {

                const dateString =
                    getLocalDateString(
                        day.date
                    );


                const dayTasks =
                    tasks.filter(
                        function (task) {

                            return (
                                task.date ===
                                dateString
                            );

                        }
                    );


                const completed =
                    dayTasks.filter(
                        function (task) {

                            return (
                                task.completed
                            );

                        }
                    ).length;


                const active =
                    dayTasks.filter(
                        function (task) {

                            return (
                                !task.completed
                            );

                        }
                    ).length;


                return {

                    ...day,

                    completed:
                        completed,

                    active:
                        active,

                    planned:
                        0

                };

            }
        );


    /* =====================================================
       FIND MAXIMUM BAR VALUE
    ===================================================== */

    const maxValue =
        Math.max(

            ...weeklyData.map(
                function (day) {

                    return Math.max(

                        day.completed,

                        day.active,

                        day.planned

                    );

                }
            ),

            1

        );


    /* =====================================================
       DRAW WEEKLY BARS
    ===================================================== */

    weeklyData.forEach(
        function (day) {

            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "week-bar-column";


            const group =
                document.createElement(
                    "div"
                );


            group.className =
                "bar-group";


            if (
                day.completed > 0
            ) {

                const bar =
                    createWeekBar(

                        "completed",

                        day.completed,

                        maxValue

                    );


                group.appendChild(
                    bar
                );

            }


            if (
                day.active > 0
            ) {

                const bar =
                    createWeekBar(

                        "active",

                        day.active,

                        maxValue

                    );


                group.appendChild(
                    bar
                );

            }


            if (
                day.completed === 0 &&
                day.active === 0
            ) {

                const emptyBar =
                    document.createElement(
                        "div"
                    );


                emptyBar.className =
                    "week-bar planned";


                emptyBar.style.height =
                    "3px";


                emptyBar.style.opacity =
                    "0.25";


                group.appendChild(
                    emptyBar
                );

            }


            column.appendChild(
                group
            );


            weeklyBars.appendChild(
                column
            );


            const dayLabel =
                document.createElement(
                    "div"
                );


            dayLabel.className =
                "week-day";


            dayLabel.textContent =
                day.name;


            if (
                getLocalDateString(
                    day.date
                ) ===
                getLocalDateString(
                    today
                )
            ) {

                dayLabel.classList.add(
                    "today"
                );

            }


            weekDays.appendChild(
                dayLabel
            );

        }
    );


    /* =====================================================
       WEEKLY SUMMARY
    ===================================================== */

    const weeklyCompleted =
        weeklyData.reduce(
            function (total, day) {

                return (
                    total +
                    day.completed
                );

            },
            0
        );


    const weeklyActive =
        weeklyData.reduce(
            function (total, day) {

                return (
                    total +
                    day.active
                );

            },
            0
        );


    const weeklyPlanned =
        weeklyData.reduce(
            function (total, day) {

                return (
                    total +
                    day.planned
                );

            },
            0
        );


    const completedElement =
        document.getElementById(
            "weeklyCompleted"
        );


    const activeElement =
        document.getElementById(
            "weeklyActive"
        );


    const plannedElement =
        document.getElementById(
            "weeklyPlanned"
        );


    if (completedElement) {

        completedElement.textContent =
            weeklyCompleted;

    }


    if (activeElement) {

        activeElement.textContent =
            weeklyActive;

    }


    if (plannedElement) {

        plannedElement.textContent =
            weeklyPlanned;

    }

}


/* =========================================================
   CREATE WEEK BAR
========================================================= */

function createWeekBar(
    type,
    value,
    maxValue
) {

    const bar =
        document.createElement(
            "div"
        );


    bar.className =
        "week-bar " + type;


    const height =
        Math.max(

            (value / maxValue) *
            175,

            8

        );


    bar.style.height =
        height + "px";


    const number =
        document.createElement(
            "span"
        );


    number.className =
        "bar-number";


    number.textContent =
        value;


    bar.appendChild(
        number
    );


    return bar;

}


/* =========================================================
   LOCAL DATE STRING
========================================================= */

function getLocalDateString(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (

        year +
        "-" +
        month +
        "-" +
        day

    );

}