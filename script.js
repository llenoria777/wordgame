let words = [];

let currentWord = null;

let hiddenPart = "";
let visiblePart = "";

let waitingNext = false;

let lastIndex = -1;


// 读取词库
async function loadVocabulary() {

    try {

        const response = await fetch("vocab.txt");

        const text = await response.text();

        words = text
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => {

                const parts = line.split("|");

                return {
                    word: parts[0].trim(),
                    meaning: parts[1].trim(),
                    sentence: parts[2].trim()
                };

            });

        if (words.length === 0) {

            document.getElementById("sentence").innerHTML =
                "No vocabulary found.";

            return;
        }

        makeQuestion();

    }
    catch (error) {

        document.getElementById("sentence").innerHTML =
            "Failed to load vocab.txt";

        console.error(error);
    }
}


// 随机抽题
function randomWord() {

    if (words.length === 1) {
        return words[0];
    }

    let index;

    do {

        index =
            Math.floor(
                Math.random() * words.length
            );

    } while (index === lastIndex);

    lastIndex = index;

    return words[index];
}


// 生成题目
function makeQuestion() {

    currentWord = randomWord();

    document.getElementById("result").innerHTML = "";
    document.getElementById("answerInput").value = "";

    const word = currentWord.word;

    let revealLength;

    if (word.length >= 8) {

        revealLength = 4;

    }
    else if (word.length >= 5) {

        revealLength = 3;

    }
    else if (word.length === 4) {

        revealLength = 2;

    }
    else {

        revealLength = 1;
    }

    visiblePart = word.slice(0, revealLength);

    hiddenPart = word.slice(revealLength);

    const blank =
        hiddenPart
            .split("")
            .map(() => "_")
            .join(" ");

    const displayWord =
        `<span class="word">${visiblePart} ${blank}</span>`;

    const sentence =
        currentWord.sentence.replace(
            word,
            displayWord
        );

    document.getElementById("sentence").innerHTML =
        sentence;

    document.getElementById("answerInput").focus();
}


// 检查答案
function checkAnswer() {

    const input =
        document
            .getElementById("answerInput")
            .value
            .trim();

    let html = "";

    if (
        input.toLowerCase() ===
        hiddenPart.toLowerCase()
    ) {

        html += `
        <div class="correct">
            ✓ Correct!
        </div>
        `;
    }
    else {

        html += `
        <div class="wrong">
            ✗ Wrong
        </div>
        `;
    }

    html += `
    <div class="meaning">
        <b>Answer:</b> ${currentWord.word}<br>
        <b>Meaning:</b> ${currentWord.meaning}
    </div>

    <div class="next">
        Press Enter for next word
    </div>
    `;

    document.getElementById("result").innerHTML =
        html;

    waitingNext = true;
}


// 回车逻辑
document
    .getElementById("answerInput")
    .addEventListener("keydown", function (e) {

        if (e.key !== "Enter") return;

        if (waitingNext) {

            waitingNext = false;

            makeQuestion();
        }
        else {

            checkAnswer();
        }
    });


// 启动
loadVocabulary();