// Состояние игры
const gameState = {
    anger: 0,
    offerings: 0,
    metSpirits: [],
    hasAmulet: false,
    foundInitialOfferings: false,
    currentScene: 'start',
    hasMetLeshy: false,
    hasMetVodyanoy: false
};

// Все сцены игры
const scenes = {
    start: {
        text: "Ты заблудился в карельских лесах. Туман сгущается, а тропа ведёт тебя вглубь древних преданий... Впереди мелькнула тень. Кто-то наблюдает за тобой.",
        choices: [
            { text: "Идти вперёд", next: "hiisi" },
            { 
                text: "Осмотреться (поискать подношения)", 
                condition: () => !gameState.foundInitialOfferings,
                next: "find_offerings" 
            },
            { text: "Аккуратно позвать на помощь", next: "call_help" }
        ]
    },
    call_help: {
        text: "Ты тихо зовешь на помощь. В ответ - только шелест листьев. Кажется, в этом лесу лучше рассчитывать только на себя.",
        next: "hiisi"
    },
    find_offerings: {
        text: "Ты находишь куст морошки. Ягоды сверкают, как янтарь. В карельских преданиях они считаются даром леса.",
        choices: [
            { 
                text: "Собрать ягоды (подношение +1)", 
                action: () => { 
                    gameState.offerings += 1;
                    gameState.foundInitialOfferings = true;
                }, 
                next: "hiisi" 
            },
            { 
                text: "Пройти мимо", 
                action: () => { gameState.foundInitialOfferings = true; },
                next: "hiisi" 
            }
        ]
    },
    hiisi: {
        text: "Из тумана появляется Хийси — лесной дух с рогами оленя и глазами, как угли. Он блокирует тропу и хрипит: «Человек... что ты дашь за проход?»",
        choices: [
            { 
                text: "Отдать подношение (если есть)", 
                condition: () => gameState.offerings > 0, 
                action: () => { gameState.offerings -= 1; }, 
                next: "after_hiisi" 
            },
            { text: "Вежливо попросить прохода", next: "hiisi_neutral" },
            { text: "Попытаться обмануть", next: "hiisi_anger" }
        ]
    },
    hiisi_neutral: {
        text: "Хийси фыркает: «Наглость! Но... ты хотя бы не кричишь». Он нехотя пропускает тебя.",
        next: "after_hiisi"
    },
    hiisi_anger: {
        text: "Хийси взрывается яростью: «Ты смеешь издеваться над духом леса?!» Он насылает на тебя чащу, которая смыкается за твоей спиной. Пути назад нет.",
        action: () => { gameState.anger += 1; },
        next: "after_hiisi"
    },
    after_hiisi: {
        text: "Тропа ведёт тебя к древнему камню с выбитыми рунами. Воздух здесь пахнет дымом и мёдом.",
        choices: [
            { text: "Прикоснуться к камню", next: "tonntu" },
            { text: "Обойти стороной", next: "leshy_encounter" },
            { 
                text: "Поискать подношения вокруг", 
                next: "find_more_offerings" 
            }
        ]
    },
    find_more_offerings: {
        text: "Около камня ты находишь несколько полезных вещей:",
        choices: [
            { 
                text: "Собрать целебные травы (подношение +1)", 
                action: () => { gameState.offerings += 1; }, 
                next: "tonntu" 
            },
            { 
                text: "Найти грибы (подношение +1)", 
                action: () => { gameState.offerings += 1; }, 
                next: "tonntu" 
            },
            { 
                text: "Вернуться к камню", 
                next: "tonntu" 
            }
        ]
    },
    leshy_encounter: {
        text: "Обойдя камень, ты попадаешь в чащу, где деревья стоят так близко, что образуют туннель. Перед тобой появляется Леший - высокий старик с зелёной бородой и ветками вместо волос.",
        choices: [
            { 
                text: "Поклониться и попросить помощи", 
                next: "leshy_neutral" 
            },
            { 
                text: "Предложить подношение (если есть)", 
                condition: () => gameState.offerings > 0,
                action: () => { gameState.offerings -= 1; },
                next: "leshy_help" 
            },
            { 
                text: "Попытаться пройти мимо", 
                next: "leshy_anger" 
            }
        ]
    },
    leshy_help: {
        text: "Леший берёт твой дар и смеётся: «Хорошо, человече. Я покажу тебе дорогу». Он указывает тропинку, которая ведёт прямо к реке.",
        action: () => { gameState.hasMetLeshy = true; },
        next: "river_encounter"
    },
    leshy_neutral: {
        text: "Леший изучающе смотрит на тебя: «Вежливый... Ладно, иди своей дорогой, но не заблудись». Он растворяется среди деревьев.",
        next: "swamp_encounter"
    },
    leshy_anger: {
        text: "Леший громко хохочет: «Думаешь, можешь пройти без спроса?» Вокруг тебя деревья начинают двигаться, меняя расположение. Ты едва находишь выход.",
        action: () => { 
            gameState.anger += 1;
            gameState.hasMetLeshy = true;
        },
        next: "swamp_encounter"
    },
    river_encounter: {
        text: "Ты выходишь к быстрой реке. Вода пенится на камнях, перейти вброд невозможно. На середине реки на коряге сидит странное существо с зелёной бородой и длинными руками.",
        choices: [
            { 
                text: "Позвать перевозчика", 
                next: "vodyanoy_encounter" 
            },
            { 
                text: "Попытаться перейти вброд", 
                next: "river_danger" 
            },
            { 
                text: "Искать другой путь", 
                next: "swamp_encounter" 
            }
        ]
    },
    vodyanoy_encounter: {
        text: "Существо подплывает ближе - это Водяной, дух рек и озёр. «Куда путь держишь, человече?» - булькает он.",
        choices: [
            { 
                text: "Попросить перевезти на другой берег", 
                next: "vodyanoy_neutral" 
            },
            { 
                text: "Предложить подношение (если есть)", 
                condition: () => gameState.offerings > 0,
                action: () => { gameState.offerings -= 1; },
                next: "vodyanoy_help" 
            },
            { 
                text: "Насмехаться над ним", 
                next: "vodyanoy_anger" 
            }
        ]
    },
    vodyanoy_help: {
        text: "Водяной берёт твой дар и кивает: «За подарок перевезу». Он доставляет тебя на другой берег, где ты видишь тропу к озеру.",
        action: () => { gameState.hasMetVodyanoy = true; },
        next: "velamo"
    },
    vodyanoy_neutral: {
        text: "Водяной хмурится: «Без даров не люблю помогать... Ладно, раз уж попросил вежливо». Он нехотно перевозит тебя.",
        next: "velamo"
    },
    vodyanoy_anger: {
        text: "Водяной в гневе хлопает по воде, поднимая волну, которая смывает тебя вниз по течению. Ты едва выбираешься на берег, весь мокрый.",
        action: () => { 
            gameState.anger += 2;
            gameState.hasMetVodyanoy = true;
        },
        next: "swamp_encounter"
    },
    river_danger: {
        text: "Ты пытаешься перейти реку, но сильное течение сбивает тебя с ног. Чудом ты выбираешься на противоположный берег, потеряв часть своих вещей.",
        action: () => { 
            gameState.offerings = Math.max(0, gameState.offerings - 1);
        },
        next: "velamo"
    },
    swamp_encounter: {
        text: "После встречи с Лешим ты оказываешься у болота. Вода здесь чёрная, а над поверхностью кружит туман.",
        choices: [
            { text: "Попытаться обойти болото", next: "bear_encounter" },
            { text: "Искать брод", next: "swamp_crossing" }
        ]
    },
    swamp_crossing: {
        text: "Ты осторожно ищешь путь через болото:",
        choices: [
            { 
                text: "Использовать длинную палку для проверки дна", 
                next: "swamp_safe" 
            },
            { 
                text: "Попытаться перейти вброд", 
                next: "swamp_danger" 
            }
        ]
    },
    swamp_safe: {
        text: "Медленно проверяя дно палкой, ты находишь безопасный путь через болото.",
        next: "bear_encounter"
    },
    swamp_danger: {
        text: "Ты проваливаешься в трясину, но чудом выбираешься, потеряв часть своих вещей.",
        action: () => { 
            gameState.offerings = Math.max(0, gameState.offerings - 1);
        },
        next: "bear_encounter"
    },
    tonntu: {
        text: "Из-за камня выползает Тонту — домовой в лохмотьях из мха. «Хозяин не любит непрошеных гостей...» — бормочет он.",
        choices: [
            { 
                text: "Отдать подношение (если есть)", 
                condition: () => gameState.offerings > 0, 
                action: () => { gameState.offerings -= 1; }, 
                next: "tonntu_help" 
            },
            { text: "Попросить помощи вежливо", next: "tonntu_neutral" },
            { text: "Прогнать его", next: "tonntu_anger" }
        ]
    },
    tonntu_help: {
        text: "Тонту жуёт твою еду и указывает когтем на тропу: «Иди туда... но берегись Водяной». Он даёт тебе оберег из берёсты.",
        action: () => { 
            gameState.metSpirits.push("tonntu");
            gameState.hasAmulet = true;
        },
        next: "velamo"
    },
    tonntu_neutral: {
        text: "Тонту недовольно хрюкает, но пропускает тебя дальше.",
        next: "velamo"
    },
    tonntu_anger: {
        text: "Тонту визжит и исчезает. После этого все двери и калитки на твоём пути оказываются заперты.",
        action: () => { gameState.anger += 1; },
        next: "velamo"
    },
    bear_encounter: {
        text: "Обойдя камень, ты встречаешь огромного медведя. В карельских преданиях медведь — священное животное.",
        choices: [
            { 
                text: "Использовать оберег (если есть)", 
                condition: () => gameState.hasAmulet,
                next: "bear_friendly" 
            },
            { 
                text: "Поискать подношения для медведя", 
                next: "find_bear_offerings" 
            },
            { text: "Медленно отступать", next: "bear_neutral" },
            { text: "Бросить в него палку", next: "bear_anger" }
        ]
    },
    find_bear_offerings: {
        text: "Ты ищешь что-то, что могло бы умилостивить медведя:",
        choices: [
            { 
                text: "Найти мёд (подношение +2)", 
                action: () => { gameState.offerings += 2; },
                next: "bear_friendly" 
            },
            { 
                text: "Собрать ягоды (подношение +1)", 
                action: () => { gameState.offerings += 1; },
                next: "bear_neutral" 
            },
            { 
                text: "Вернуться к медведю с пустыми руками", 
                next: "bear_neutral" 
            }
        ]
    },
    bear_friendly: {
        text: "Медведь принимает твой дар и позволяет пройти. Ты чувствуешь, что заслужил его уважение.",
        next: "velamo"
    },
    bear_neutral: {
        text: "Медведь фыркает, но позволяет тебе уйти. Ты чувствуешь, что избежал большой опасности.",
        next: "velamo"
    },
    bear_anger: {
        text: "Медведь встаёт на дыбы и рычит! Ты едва успеваешь убежать, потеряв часть своих вещей.",
        action: () => { 
            gameState.anger += 1;
            gameState.offerings = Math.max(0, gameState.offerings - 1);
        },
        next: "velamo"
    },
    velamo: {
        text: "Ты выходишь к озеру. В лунном свете на воде танцует женская фигура — это Велламо, дух воды. «Что привело тебя к моим владениям?» — спрашивает она.",
        choices: [
            { text: "Попросить безопасного пути", next: "velamo_neutral" },
            { 
                text: "Бросить в воду подношение (если есть)", 
                condition: () => gameState.offerings > 0, 
                action: () => { gameState.offerings -= 1; }, 
                next: "velamo_help" 
            },
            { 
                text: "Поискать подношения у озера", 
                next: "find_lake_offerings" 
            },
            { text: "Разозлить её (плюнуть в воду)", next: "velamo_anger" }
        ]
    },
    find_lake_offerings: {
        text: "У кромки воды ты находишь:",
        choices: [
            { 
                text: "Красивый камень (подношение +1)", 
                action: () => { gameState.offerings += 1; },
                next: "velamo" 
            },
            { 
                text: "Рыбу (подношение +1)", 
                action: () => { gameState.offerings += 1; },
                next: "velamo" 
            },
            { 
                text: "Вернуться к Велламо", 
                next: "velamo" 
            }
        ]
    },
    velamo_help: {
        text: "Велламо берёт дар и поёт: «Иди по камням, где светятся мхи...» Камни действительно начинают мерцать, указывая путь.",
        next: "endgame"
    },
    velamo_anger: {
        text: "Вода вздымается, хватает тебя за ноги и тянет вглубь. Ты едва вырываешься, но теперь весь мокрый и дрожишь от холода.",
        action: () => { gameState.anger += 2; },
        next: "endgame"
    },
    endgame: {
        text: () => {
            if (gameState.anger >= 5) {
                return "Духи леса больше не терпят твоего присутствия. Тени смыкаются вокруг, и ты чувствуешь, как тебя затягивает в вечный туман... КОНЕЦ: Добыча Тьмы";
            } else if (gameState.metSpirits.includes("tonntu") && gameState.anger === 0 && gameState.hasMetLeshy && gameState.hasMetVodyanoy) {
                return "Ты находишь деревню, где тебя встречают как великого знатока духов. Старейшины говорят, что ты удостоился чести видеть всех главных духов и остаться в живых. КОНЕЦ: Друг духов";
            } else if (gameState.metSpirits.includes("tonntu") && gameState.anger === 0 && gameState.hasMetLeshy) {
                return "Ты находишь деревню, где тебя встречают как избранника духов. Старейшины говорят, что ты удостоился чести видеть Лешего и других духов. КОНЕЦ: Посвящённый";
            } else if (gameState.offerings >= 5 && gameState.anger <= 1) {
                return "Твои щедрые подношения не остались незамеченными. Духи леса провожают тебя до дома, и ты чувствуешь их благодарность. КОНЕЦ: Щедрый даритель";
            } else {
                return "Из последних сил ты выбираешься на знакомую дорогу. За спиной ещё долго слышится шепот, но ты больше никогда не забудешь этот лес... КОНЕЦ: Возвращение";
            }
        },
        next: "restart"
    },
    restart: {
        text: "Хочешь попробовать другой путь?",
        choices: [
            { text: "Да, начать заново", next: "start" },
            { text: "Нет, закончить", action: () => { alert("Спасибо за игру!"); } }
        ]
    }
};

// Обновление сцены
function updateScene(sceneId) {
    const scene = scenes[sceneId];
    gameState.currentScene = sceneId;
    
    // Обновление текста
    document.getElementById('story-text').innerHTML = 
        typeof scene.text === 'function' ? scene.text() : scene.text;
    
    // Обновление кнопок выбора
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';
    
    if (scene.choices && scene.choices.length > 0) {
        scene.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            
            if (choice.condition && !choice.condition()) {
                button.disabled = true;
            } else {
                button.onclick = () => {
                    if (choice.action) choice.action();
                    updateScene(choice.next);
                };
            }
            
            choicesDiv.appendChild(button);
        });
        document.getElementById('continue-btn').classList.add('hidden');
    } else {
        // Если нет выбора, показываем кнопку продолжения
        document.getElementById('continue-btn').classList.remove('hidden');
        document.getElementById('continue-btn').onclick = () => {
            updateScene(scene.next);
        };
    }
    
    if (scene.action) scene.action();
    updateStats();
}

function makeChoice(choiceIndex) {
    const scene = scenes[gameState.currentScene];
    if (!scene.choices || choiceIndex > scene.choices.length) return;
    
    const choice = scene.choices[choiceIndex - 1];
    
    if (choice.condition && !choice.condition()) {
        return;
    }
    
    if (choice.action) choice.action();
    updateScene(choice.next);
}

function continueGame() {
    const scene = scenes[gameState.currentScene];
    updateScene(scene.next);
}

function updateStats() {
    document.getElementById('anger').textContent = gameState.anger;
    document.getElementById('offerings').textContent = gameState.offerings;
}

function restartGame() {
    // Полный сброс состояния игры
    gameState.anger = 0;
    gameState.offerings = 0;
    gameState.metSpirits = [];
    gameState.hasAmulet = false;
    gameState.foundInitialOfferings = false;
    gameState.hasMetLeshy = false;
    gameState.hasMetVodyanoy = false;
    updateScene('start');
}

// Начало игры
updateScene('start');