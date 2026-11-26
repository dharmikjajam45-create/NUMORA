const result = document.getElementById("result");
const history = document.getElementById("history");
const historyList = document.getElementById("history-list");

const keys = document.querySelectorAll(".key");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    result.textContent = expression || "0";
}

function addHistory(original, answer) {
    const emptyMessage = historyList.querySelector(".empty-history");

    if (emptyMessage) {
        emptyMessage.remove();
    }

    const entry = document.createElement("div");
    entry.className = "history-entry";

    const calculation = document.createElement("span");
    calculation.textContent = original;

    const value = document.createElement("strong");
    value.textContent = answer;

    entry.append(calculation, value);
    historyList.prepend(entry);
}

function addValue(value) {
    if (justCalculated) {
        if ("+-*/".includes(value)) {
            justCalculated = false;
        } else {
            expression = "";
            history.textContent = "";
            justCalculated = false;
        }
    }

    const last = expression.slice(-1);

    if ("+-*/".includes(value)) {
        if (!expression && value !== "-") return;

        if ("+-*/".includes(last)) {
            expression = expression.slice(0, -1);
        }
    }

    expression += value;
    updateDisplay();
}

function clearAll() {
    expression = "";
    history.textContent = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function addDecimal() {
    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    const currentNumber = expression.split(/[+\-*/]/).pop();

    if (!currentNumber.includes(".")) {
        expression += currentNumber ? "." : "0.";
    }

    updateDisplay();
}

function calculateExpression() {
    if (!/^[0-9+\-*/.() ]+$/.test(expression)) {
        throw new Error("Invalid expression");
    }

    const answer = Function(
        '"use strict"; return (' + expression + ')'
    )();

    if (!Number.isFinite(answer)) {
        throw new Error("Invalid calculation");
    }

    return Number(answer.toPrecision(12));
}

function calculate() {
    if (!expression) return;

    try {
        const original = expression;
        const answer = calculateExpression();

        history.textContent = original + " =";

        expression = String(answer);
        result.textContent = expression;

        addHistory(original, answer);

        justCalculated = true;

    } catch {
        result.textContent = "Error";
        expression = "";
        justCalculated = false;
    }
}

function percentage() {
    if (!expression) return;

    try {
        expression = String(calculateExpression() / 100);
        updateDisplay();
        justCalculated = true;
    } catch {
        result.textContent = "Error";
        expression = "";
    }
}

function changeSign() {
    if (!expression) return;

    try {
        expression = String(-calculateExpression());
        updateDisplay();
        justCalculated = true;
    } catch {
        result.textContent = "Error";
        expression = "";
    }
}

// Button interactions

keys.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (value !== undefined) {
            addValue(value);
            return;
        }

        switch (action) {
            case "clear":
                clearAll();
                break;

            case "delete":
                deleteLast();
                break;

            case "decimal":
                addDecimal();
                break;

            case "percent":
                percentage();
                break;

            case "sign":
                changeSign();
                break;

            case "calculate":
                calculate();
                break;
        }
    });
});

// Keyboard support

document.addEventListener("keydown", event => {
    if (/^[0-9]$/.test(event.key)) {
        addValue(event.key);
    } else if ("+-*/".includes(event.key)) {
        addValue(event.key);
    } else if (event.key === ".") {
        addDecimal();
    } else if (event.key === "Enter" || event.key === "=") {
        calculate();
    } else if (event.key === "Backspace") {
        deleteLast();
    } else if (event.key === "Escape") {
        clearAll();
    } else if (event.key === "%") {
        percentage();
    }
});