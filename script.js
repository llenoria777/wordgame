let words = [];

let currentWord = null;

let visiblePart = "";
let hiddenPart = "";

let waitingNext = false;

let lastIndex = -1;



// =======================
// 读取词库
// =======================

async function loadVocabulary() {

    try {

        const response =
            await fetch(
                "vocab.txt?t=" + Date.now()
            );

        const text =
            await response.text();

        words = text
            .split("\n")
            .filter(line => line.trim())
            .map(line => {

                const parts =
                    line.split("|");

                return {

                    word:
                        parts[0]?.trim() || "",

                    meaning:
                        parts[1]?.trim() || "",

                    sentence:
                        parts[2]?.trim() || ""

                };

            });

        makeQuestion();

    }
    catch (error) {

        console.error(error);

        document.getElementById(
            "sentence"
        ).innerHTML =
            "Failed to load vocab.txt";
    }
}



// =======================
// 随机单词
// =======================

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



// =======================
// 生成题目
// =======================

function makeQuestion() {

    currentWord = randomWord();

    document.getElementById(
        "result"
    ).innerHTML = "";

    const word =
        currentWord.word;

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

    visiblePart =
        word.slice(0, revealLength);

    hiddenPart =
        word.slice(revealLength);



    // =======================
    // 例句
    // =======================

    const blanks =
        "_ ".repeat(
            hiddenPart.length
        );

    const displayWord =
        `${visiblePart} ${blanks}`;

    let sentence =
        currentWord.sentence;

    if (
        sentence &&
        sentence
            .toLowerCase()
            .includes(
                word.toLowerCase()
            )
    ) {

        const regex =
            new RegExp(
                word,
                "i"
            );

        sentence =
            sentence.replace(
                regex,
                displayWord
            );
    }

    document.getElementById(
        "sentence"
    ).innerHTML =
        sentence ||
        displayWord;



    // =======================
    // 字母格
    // =======================

    const wordArea =
        document.getElementById(
            "wordArea"
        );

    wordArea.innerHTML = "";



    const prefix =
        document.createElement(
            "span"
        );

    prefix.className =
        "prefix";

    prefix.textContent =
        visiblePart;

    wordArea.appendChild(
        prefix
    );



    for (
        let i = 0;
        i < hiddenPart.length;
        i++
    ) {

        const input =
            document.createElement(
                "input"
            );

        input.type = "text";

        input.maxLength = 1;

        input.className =
            "letter-box";



        input.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(
                            /[^a-zA-Z]/g,
                            ""
                        );

                if (
                    this.value &&
                    this.nextElementSibling
                ) {

                    this.nextElementSibling
                        .focus();
                }

            }
        );



        input.addEventListener(
            "keydown",
            function (e) {

                if (
                    e.key ===
                    "Backspace"
                ) {

                    if (
                        !this.value &&
                        this.previousElementSibling &&
                        this.previousElementSibling.classList.contains(
                            "letter-box"
                        )
                    ) {

                        this.previousElementSibling
                            .focus();
                    }

                }

                if (
                    e.key ===
                    "Enter"
                ) {

                    if (
                        waitingNext
                    ) {

                        waitingNext =
                            false;

                        makeQuestion();
                    }
                    else {

                        checkAnswer();
                    }
                }

            }
        );



        wordArea.appendChild(
            input
        );
    }



    const firstInput =
        document.querySelector(
            ".letter-box"
        );

    if (firstInput) {

        firstInput.focus();
    }

}



// =======================
// 检查答案
// =======================

function checkAnswer() {

    const boxes =
        document.querySelectorAll(
            ".letter-box"
        );

    let userAnswer =
        "";

    boxes.forEach(box => {

        userAnswer +=
            box.value;
    });



    const correct =
        userAnswer.toLowerCase() ===
        hiddenPart.toLowerCase();



    boxes.forEach(
        (box, index) => {

            if (
                box.value.toLowerCase() ===
                hiddenPart[index]
                    .toLowerCase()
            ) {

                box.classList.add(
                    "correct-box"
                );
            }
            else {

                box.classList.add(
                    "wrong-box"
                );
            }

        }
    );



    let html = "";

    if (correct) {

        html +=
            `<div class="correct">
                ✓ Correct!
            </div>`;
    }
    else {

        html +=
            `<div class="wrong">
                ✗ Wrong
            </div>`;
    }



    html += `
        <div class="meaning">
            <b>Answer:</b>
            ${currentWord.word}
            <br><br>

            <b>Meaning:</b>
            ${currentWord.meaning}
        </div>

        <div class="next">
            Press Enter for next word
        </div>
    `;



    document.getElementById(
        "result"
    ).innerHTML = html;

    waitingNext = true;
}



// =======================
// 全局 Enter
// =======================

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Enter" &&
            waitingNext
        ) {

            waitingNext = false;

            makeQuestion();
        }

    }
);



// =======================
// 启动
// =======================

loadVocabulary();
