import {UrlManager} from "../utils/url-manager.js";
import {Auth} from "../services/auth.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";

export class Answers {
    constructor() {
        this.quiz = null;

        this.routeParams = UrlManager.getQueryParams();
        this.init();
        this.showUserData();
        this.backToResult();
    }

    async init() {
        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }
        if(this.routeParams.id) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' +
                    userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.quiz = result;
                    console.log(this.quiz.test)
                    this.showTestName();
                    this.showAnswers();
                    // return;
                }
            } catch (error) {
                console.log(error);
            }
        }


    }

    showAnswers () {
        // формируем правильные и неправидльные варианты ответа
        if (this.quiz.test && this.quiz.test.questions.length > 0) {
            const questions = document.querySelector('.correct-answers');
            questions.innerHTML = '';

            let chosenAnswerIndex;
            let correctAnswerIndex;

            this.quiz.test.questions.forEach((questionItem, questionIndex) => {
                const question = document.createElement('div');
                question.className = 'correct-answers-options';

                const questionTitle = document.createElement('div');
                questionTitle.className = 'correct-answer-title';
                questionTitle.innerHTML = `<span>Вопрос ${questionIndex + 1}:</span> ${questionItem.question}`;

                const questionOptions = document.createElement('div');
                questionOptions.className = 'correct-answer-options';

                question.appendChild(questionTitle);
                question.appendChild(questionOptions);
                questions.appendChild(question);



                questionItem.answers.forEach((answerItem, answerIndex) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'correct-answer-option';

                    if (answerItem.correct === true) {
                            optionElement.classList.add('checked-correct')
                    } else if(answerItem.correct === false){
                        optionElement.classList.add('checked-wrong')
                    }

                    const answerElement = document.createElement('div');
                    answerElement.className = 'option-answer';

                    optionElement.appendChild(answerElement);
                    optionElement.append(answerItem.answer);
                    questionOptions.appendChild(optionElement);
                });
            });
        }
    }

    // вывод инфы о пользователе, который прошел квест
    showUserData() {
        const userInfo = Auth.getUserInfo();
        const userEmail = Auth.getUserEmail();

        document.querySelector('.answer-user-name').innerHTML = `<span>Тест выполнил</span> ${userInfo.fullName}, ${userEmail.email} `;
    }


    showTestName() {
        document.getElementById('answer-pre-title').innerText = this.quiz.test.name;
    }


    backToResult() {
        const that = this;
        const backToResult = document.getElementById('back');
        backToResult.addEventListener('click', () =>  {
            location.href = '#/result?id=' + that.routeParams.id;
        })
    }

}
