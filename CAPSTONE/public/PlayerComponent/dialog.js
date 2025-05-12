import { Npc } from './npc.js';

export class Dialog{
    constructor(game,content){
        this.game=game;
        this.content=content;
    }

    updateDialog(dialogue_id){
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
        this.optionBoxes=[]

        let game=this.game;
        let cam = game.cameras.main;

        let dialogX = cam.scrollX+(30);
        let dialogY = cam.scrollY+(game.gameHeight - 150);
        let dialogWidth = (game.gameWidth - 100);
        let dialogHeight = 145;
        this.graphics = game.add.graphics();
        this.graphics.fillStyle(0x000000, 0.7);
        this.graphics.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 20);
        this.graphics.setInteractive(
            new Phaser.Geom.Rectangle(dialogX, dialogY, dialogWidth, dialogHeight),
            Phaser.Geom.Rectangle.Contains
        );

        let question = game.dialogue.find(dialogue => dialogue.dialogue_id === dialogue_id);
        console.log(question);
        this.questionBox = game.add.text(60, game.gameHeight - 135, question.text, {
            font: '24px Arial',
            fill: '#ffffff',
            wordWrap: { width: game.gameWidth - 130 }
        });
        this.questionBox.setScrollFactor(0);

        let choices = game.choice.filter(choice => choice.dialogue_id === dialogue_id);
        if (choices.length>0){
            console.log(choices);
            let i=0;
            //choice: option text; value: respond text
            for (let option of choices){
                let choice = option.text;
                let optionX = 60 + cam.scrollX;
                let optionY = game.gameHeight - (125-35*i) + cam.scrollY + this.questionBox.height;
                this.option = game.add.text(optionX, optionY, `Option ${i+1}: ${choice}`, {
                    font: '20px Arial',
                    fill: '#ffffff',
                    wordWrap: { width: game.gameWidth - 130 }
                }).setInteractive();

                this.optionBoxes.push(this.option);

                this.option.on('pointerdown', () => {
                    this.destroyDialog();
                    if (question.action_id){
                        this.performAction(question.action_id);
                    }

                    if (option.package_id){
                        let available = this.updateInventory(option.package_id);
                        if (!available){
                            this.showResponse(option.alt_text);
                            console.log(option.alt_text);
                            return;
                        }
                    }
                    if (option.respond!="" && option.respond!=null){
                        this.showResponse(option.respond);
                        console.log(option.respond);
                        return;
                    }

                    this.count++;
                    if (this.count<this.content.length){
                        let current_dialogue = this.content[this.count];
                        this.updateDialog(current_dialogue.dialogue_id);
                        console.log(current_dialogue.dialogue_id);
                    }else{
                        game.collisionHappened=false;
                        this.game.checkNarrator();
                        this.game.spawnNpc();
                    }
                });

                i++;
            }
        }else{
            // if (choices.animation){
            //     let npc = this.game.touching.npc;
            //     this.game.npc[npc.tag].play(choices.animation);
            // }
            this.graphics.setInteractive(new Phaser.Geom.Rectangle(dialogX, dialogY, dialogWidth, dialogHeight), Phaser.Geom.Rectangle.Contains);

            this.graphics.on('pointerdown', () => {
                if (this.content[this.count].package_id){
                    this.updateInventory(this.content[this.count].package_id);
                }
                this.destroyDialog();
                if (question.action_id){
                    this.performAction(question.action_id);
                }
                this.count++;
                if (this.count<this.content.length){
                    let current_dialogue = this.content[this.count];
                    this.updateDialog(current_dialogue.dialogue_id);
                }else{
                    game.collisionHappened=false;
                    this.game.checkNarrator();
                    this.game.spawnNpc();
                }
            });
        }
    }

    showResponse(text) {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
        // Show the response text in a dialog box
        let game = this.game;
        let cam = game.cameras.main;
        let dialogX = cam.scrollX + 30;
        let dialogY = cam.scrollY + (game.gameHeight - 150);
        let dialogWidth = (game.gameWidth - 100);
        let dialogHeight = 140;

        this.graphics = game.add.graphics();
        this.graphics.fillStyle(0x000000, 0.7);
        this.graphics.fillRoundedRect(dialogX, dialogY, dialogWidth, dialogHeight, 20);
        this.graphics.setInteractive(
            new Phaser.Geom.Rectangle(dialogX, dialogY, dialogWidth, dialogHeight),
            Phaser.Geom.Rectangle.Contains
        );

        this.questionBox = game.add.text(60, game.gameHeight - 130, text, {
            font: '24px Arial',
            fill: '#ffffff',
            wordWrap: { width: game.gameWidth - 120 }
        });
        this.questionBox.setScrollFactor(0);

        this.graphics.once('pointerdown', () => {
            this.destroyDialog();
            this.count++;
            console.log(this.count, this.content.length);
            if (this.count<this.content.length){
                let current_dialogue = this.content[this.count];
                this.updateDialog(current_dialogue.dialogue_id);
                console.log(current_dialogue.dialogue_id);
            }else{
                game.collisionHappened=false;
                this.game.checkNarrator();
                this.game.spawnNpc();
            }
        });
    }

    performAction(action){
        let actionDetail = this.game.action[action];
        console.log(actionDetail);
        if (actionDetail.type === "move"){
            this.game.moveNpcTo(actionDetail.npc, actionDetail.endPosition.x, actionDetail.endPosition.y, actionDetail.speed);
        }else if (actionDetail.type === "spawn"){
            let npcs = actionDetail.npc
            let positions = actionDetail.position
            for (let i=0; i<npcs.length; i++){
                this.game.npc[npcs[i]] = new Npc(this.game, positions[i].x, positions[i].y, npcs[i], "", "");
            }
        }else if (actionDetail.type === "remove"){
            let npcs = actionDetail.npc
            for (let i=0; i<npcs.length; i++){
                this.game.npc[npcs[i]].anims.stop();
                this.game.npc[npcs[i]].destroy();
            }
        }else if (actionDetail.type === "move_remove"){
            this.game.moveNpcTo(actionDetail.npc, actionDetail.endPosition.x, actionDetail.endPosition.y, actionDetail.speed, true);
        }
    }


    async updateInventory(package_id){
        let package_detail = this.game.packageDetail.filter(packageDetail => packageDetail.package_id === package_id);
        console.log(package_detail);

        for (let item of package_detail) { //check if item enough for negative amount (giving item)
            if (item.amount<0){
                let response = await fetch(`https://capstone-assignment-36lq.vercel.app/inventory/amount?player_id=${this.game.player_id}&item_id=${item.item_id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                });
                let amount = await response.json();
                console.log(amount);
                if (amount<item.amount){
                    return false;
                }
            }
        }

        for (let item of package_detail) { //update inventory
            let itemDetail = this.game.item.find(itemDetail => itemDetail.item_id === item.item_id);
            console.log(itemDetail);
            if (itemDetail.type === "milestone"){
                fetch("https://capstone-assignment-36lq.vercel.app/player_progress/update", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                    player_id: this.game.player_id,
                    subquest_id: this.game.registry.get("activeSubQuest"),
                    status: "Completed",
                    }),
                });
                let nextSubQuest = this.game.package.find(packages => packages.package_id === package_id).subquest_id;
                console.log(nextSubQuest);
                this.game.registry.set("activeSubQuest", nextSubQuest);
                this.game.npcList = Object.values(this.game.npc);
                console.log(this.game.registry.get("activeSubQuest"));
                let nextActiveSubquest = this.game.subquest.find(subquest => subquest.subquest_id === nextSubQuest);
                console.log(nextActiveSubquest);
                if (nextActiveSubquest){
                    let nextQuest = nextActiveSubquest.quest_id;
                    this.game.registry.set("activeQuest", nextQuest);
                    fetch("https://capstone-assignment-36lq.vercel.app/player_progress/update", {
                        method: "POST",
                        headers: {
                        "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                        player_id: this.game.player_id,
                        subquest_id: this.game.registry.get("activeSubQuest"),
                        status: "In Progress",
                        }),
                    });
                    console.log("update player progress");
                }
                return true;
            }
            fetch("https://capstone-assignment-36lq.vercel.app/inventory", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                player_id: this.game.player_id,
                item_id: item.item_id,
                amount: item.amount,
                }),
            });
        }
        return true;
    }

    showDialogs(){
        this.count=0;
        let current_dialogue = this.content[this.count];
        this.updateDialog(current_dialogue.dialogue_id);
    }

    destroyDialog() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
            console.log("destroy graphics");
        }
        if (this.questionBox) {
            this.questionBox.destroy();
            this.questionBox = null;
        }
        this.optionBoxes.forEach(box => box.destroy());
        this.optionBoxes = [];
    }
}