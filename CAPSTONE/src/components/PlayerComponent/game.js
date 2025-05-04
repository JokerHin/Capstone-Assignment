import { Dialog } from './dialog.js';
import { Npc } from './npc.js';
import { Backdrop } from './backdrop.js';
import { Door } from './door.js';
import { IndoorScene } from './indoorScene.js';

import { useContext } from "react";
import { AppContent } from "../context/AppContext";



class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.collisionHappened = false
        this.touching={'door':null,'npc':null}; //in case touching door and npc at the same time
        this.inventory=[];
        this.fulfill=[]
        this.npc={};
        this.backdrop={};
        this.doors={};
        this.current_bg;
        this.movementSpeed=200; //200
        this.player_direction=-1;
        this.zoomFactor=1.8; //1.8
        this.locationId=0;
        this.player_id=1; //need change to cookie player
    }

    init(data) {
        // Receive game width & height from the constructor
        this.gameWidth = data.width;
        this.gameHeight = data.height;
        this.sceneName = data.sceneName; //town (default scene)
        this.dialogue = data.dialogue || {};
        this.quest = data.quest || {};
        this.location = data.location || {};
        this.inventory = data.inventory || [];
        this.item = data.item || {};
        this.action = data.action || {};
        this.packageDetail = data.packageDetail || {};
        this.position = data.position || {};
        this.subquest = data.subquest || {};
        this.package = data.package || {};
        this.choice = data.choice || {};
        this.playerProgress = data.playerProgress || {};
        this.npcDetail = data.npcDetail || {};
        this.locationDetail = data.locationDetail || {};
    }

    preload() {
        this.load.image("Dungeon_Tileset", "../assets/map_asset/Dungeon_Tileset.png");
        this.load.image("Big_Set", "../assets/map_asset/Big_Set.png");
        this.load.image("Rustic_Indoor", "../assets/map_asset/Rustic_Indoor.png");
        this.load.tilemapTiledJSON("map1", "../assets/map_asset/map1.tmj"); //Mbat, Dungeon_Tileset
        this.load.tilemapTiledJSON("map2", "../assets/map_asset/map2.tmj"); //House1, Big_Set
        this.load.tilemapTiledJSON("map3", "../assets/map_asset/map3.tmj"); //House2, Big_Set
        this.load.tilemapTiledJSON("map4", "../assets/map_asset/map4.tmj"); //House3, Big_Set
        this.load.tilemapTiledJSON("map5", "../assets/map_asset/map5.tmj"); //Diner, Rustic_Indoor
        this.load.tilemapTiledJSON("map6", "../assets/map_asset/map6.tmj"); //Purple, Rustic_Indoor

        this.load.image('town_bg', '../assets/town_map.jpg');
        this.load.image('town_obstacle', '../assets/town_map_obstacle.png');
        this.load.spritesheet('fighter', '../assets/mc_spritesheet.png', {
            frameWidth: 641,  // Adjust based on your sprite sheet
            frameHeight: 640.8
        });
        this.load.image("house1_interior", "../assets/house1_interior.png");
        this.load.image("ownhouse_interior", "../assets/ownhouse_interior.jpg");

        this.load.image('inventory_icon', '../assets/inventory_icon.png'); // Replace with the actual path to your image
        this.load.image('close_icon', '../assets/close_icon.webp');
        this.load.image('menu_icon', '../assets/menu_icon.png');
        this.load.image('scroll_background', '../assets/scroll_background2.png');

        for (let [tag,npc] of Object.entries(this.npcDetail)){
            if (npc.type === "image") {
                this.load.image(tag, `../assets/${npc.img}`);
            }else if (npc.type === "spritesheet"){
                this.load.spritesheet(tag, `../assets/${npc.img}`, {
                    frameWidth: npc.frameSize.width,
                    frameHeight: npc.frameSize.height
                });
            }
        }
    }

    create() {
        //set initial quest and subquest in the beginning
        //use registry to store data across all scenes
        // let activeQuest = this.quest.init; //comment this before committing
        // let activeQuest = "quest2"; //uncomment this before committing
        let activeQuest = 1;
        // let activeSubQuest = this.quest[activeQuest].startquest;
        let activeSubQuest = 1;
        this.registry.set("activeQuest", activeQuest);
        this.registry.set("activeSubQuest", activeSubQuest);
        this.registry.set("inventory", this.inventory);
        this.registry.set("fulfill", this.fulfill);

        //import background
        let locationDetail = this.locationDetail[this.locationId];
        this.cameras.main.setBackgroundColor(locationDetail.bgcolor);
        this.zoomFactor=locationDetail.scale;
        this.backdrop['map'] = new Backdrop(this, 0, 0, locationDetail.img, this.zoomFactor);
        this.current_bg=this.backdrop['map'];

        //import npc
        this.spawnNpc();

        //player (fighter)
        this.player = this.physics.add.sprite(this.gameWidth / 2, this.gameHeight / 2, 'fighter');
        this.player.setScale(0.1);

        //background obstacle
        this.backdrop['obstacle'] = new Backdrop(this, 0, 0, 'town_obstacle', this.zoomFactor);

        this.anims.create({
            key: 'fighter_left',
            frames: this.anims.generateFrameNumbers('fighter', { start: 8, end: 13 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'fighter_right',
            frames: this.anims.generateFrameNumbers('fighter', { start: 14, end: 19 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'fighter_left_idle',
            frames: this.anims.generateFrameNumbers('fighter', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'fighter_right_idle',
            frames: this.anims.generateFrameNumbers('fighter', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        //house collision area (door)
        let locationDoors = this.location.filter(location => location.location_id !== this.locationId);
        for (let location of locationDoors){ //dictionary contains info of a door
            let location_id = location.location_id
            let label = this.locationDetail[location_id].label
            let entrance = location.entrance_position;
            this.doors[location_id] = new Door(this, entrance.x1, entrance.y1, entrance.x2, entrance.y2, '#000', label, location_id, 0); //create a door object
        }

        //Talk to npc button
        this.talkButton = this.add.text(this.gameWidth/2+50, this.gameHeight/2-50, 'Talk to someone', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        })
        .setPadding(10)
        .setInteractive() // Make the text clickable
        .on('pointerdown', () => {
            this.talk();
        });
        this.talkButton.setVisible(false);

        //Enter house button
        this.enterButton = this.add.text(this.gameWidth/2+50, this.gameHeight/2-50, 'Enter house', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        })
        .setPadding(10)
        .setInteractive() // Make the text clickable
        .on('pointerdown', () => {
            this.enterDoor();
        });
        this.enterButton.setVisible(false);

        // Create a menu button on the top-right corner
        this.inventoryButton = this.add.image(this.gameWidth - 50, 50, 'inventory_icon') // Replace 'menuIcon' with your image key
            .setScale(0.2) // Scale the image if needed
            .setInteractive() // Make the image clickable
            .on('pointerdown', () => {
                this.openInventory(); // Call the menu function when clicked
            });
        this.inventoryButton.setScrollFactor(0);

        // Ensure the button stays on top
        this.children.bringToTop(this.inventoryButton);

        //Menu button
        this.menuButton = this.add.image(this.gameWidth - 50, 150, 'menu_icon') // Replace 'menuIcon' with your image key
            .setScale(0.4) // Scale the image if needed
            .setInteractive() // Make the image clickable
            .on('pointerdown', () => {
                this.openMenu(); // Call the menu function when clicked
            });
        this.menuButton.setScrollFactor(0);

        // Ensure the button stays on top
        this.children.bringToTop(this.menuButton);

        //Collision listener
        this.npcList = Object.values(this.npc);
        this.physics.add.overlap(this.player, this.npcList, this.showTalk, null, this);
        this.doorList = Object.values(this.doors);
        this.physics.add.overlap(this.player, this.doorList, this.showEnter, null, this);

        //Initial position of the player
        let spawnPos = this.location.find(location => location.location_id === this.locationId).spawn_position;
        let playerStartPosX = spawnPos.x * this.zoomFactor;
        let playerStartPosY = spawnPos.y * this.zoomFactor;
        this.player.setPosition(playerStartPosX,playerStartPosY);

        //detect back to mainscene from indoor scene
        this.events.on("wake", () => {
            console.log("MainScene Resumed");
            console.log(this.registry.get("activeQuest"));
            console.log(this.registry.get("activeSubQuest"));
            if (this.npcList.length==0 ){
                this.spawnNpc();
            }
        });

        // this.cameras.main.setZoom(zoomFactor);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.current_bg.width*this.zoomFactor, this.current_bg.height*this.zoomFactor);
        this.physics.world.setBounds(0, 0, this.current_bg.width*this.zoomFactor, this.current_bg.height*this.zoomFactor);
        this.player.setCollideWorldBounds(true); // Prevent the player from moving outside the bounds
        // this.movementSpeed = this.movementSpeed/zoomFactor;

        //initiate first quest for new user
        fetch("https://codyssey-mongodb.vercel.app/player_progress", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            player_id: this.player_id,
            subquest_id: 1,
            status: "In Progress",
            }),
        });
    }

    update() {
        let cursors = this.input.keyboard.createCursorKeys();
        let keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.player.setVelocity(0);
        let moveX=0;
        let moveY=0;

        if (this.collisionHappened) {
            if (this.player_direction==1) {
                this.player.anims.play('fighter_left_idle', true);
            }else if (this.player_direction==-1){
                this.player.anims.play('fighter_right_idle', true);
            }
        }else{
            if (cursors.left.isDown || keys.A.isDown) { //move left
                moveX-=1;
                this.player_direction=1
            }
            if (cursors.right.isDown || keys.D.isDown) { //move right
                moveX+=1;
                this.player_direction=-1
            }
            if (cursors.up.isDown || keys.W.isDown) { //move up
                moveY-=1;
            }
            if (cursors.down.isDown || keys.S.isDown) { //move down
                moveY+=1;
            }
            if (moveX!=0 || moveY!=0) {
                if (this.player_direction==1) {
                    this.player.anims.play('fighter_left', true);
                }else if (this.player_direction==-1){
                    this.player.anims.play('fighter_right', true);
                }
            }else{
                if (this.player_direction==1) {
                    this.player.anims.play('fighter_left_idle', true);
                }else if (this.player_direction==-1){
                    this.player.anims.play('fighter_right_idle', true);
                }
            }
            this.player.setVelocity(this.movementSpeed*moveX, this.movementSpeed*moveY);
        }

        if (!this.physics.overlap(this.player, this.npcList)) {
            this.talkButton.setVisible(false);
        }

        if (!this.physics.overlap(this.player, this.doorList)) {
            this.enterButton.setVisible(false);
        }
    }

    spawnNpc(){
        for (let npc of Object.values(this.npc)){
            npc.anims.stop();
            npc.destroy();
        }
        this.npc={};
        this.npcList = [];

        //import npc
        let activeSubQuest = this.registry.get("activeSubQuest");

        let posData = this.position.filter(position => position.location_id === this.locationId && (position.subquest_id === activeSubQuest || position.subquest_id === null));
        console.log(posData);

        for (let pos of posData){ //loop through all npc
            let coordinate = pos.coordinates;
            let tag = pos.npc;
            console.log(tag);
            let npcData = this.npcDetail[tag];
            console.log(npcData);
            this.npc[tag] = new Npc(this, coordinate.x, coordinate.y, tag, npcData.name, npcData.scale);
            if (npcData.animation){
                for (let [key,anim] of Object.entries(npcData.animation)){
                    if (!this.anims.exists(key)){
                        this.anims.create({
                            key: key,
                            frames: this.anims.generateFrameNumbers(tag, { start: anim.startFrame, end: anim.endFrame }),
                            frameRate: anim.frameRate, // Adjust speed (frames per second)
                            repeat: anim.repeat // -1 = Loop infinitely
                        });
                    }
                }
                this.npc[tag].setFrame(npcData.initialFrame);
                this.npc[tag].play("idle");
            }
        }
        this.children.bringToTop(this.player);
        this.children.bringToTop(this.backdrop['obstacle']);
        this.children.bringToTop(this.inventoryButton);
        this.children.bringToTop(this.menuButton);
    }

    talk() {
        this.talkButton.setVisible(false);
        this.collisionHappened = true;
        let object = this.touching['npc'];
        console.log(`Talking to the ${object.name}...`);
        let chats = this.dialogue.filter(dialogue => dialogue.position_id === object.position_id);
        console.log(chats);
        this.dialog1 = new Dialog(this,chats);
        this.dialog1.showDialogs();
    }

    enterDoor() {
        this.enterButton.setVisible(false);
        let objectName = this.touching['door'].label;
        console.log(`Entering ${objectName}...`);

        //switch to indoor scene without pausing or shutdown MainScene
        this.scene.switch('IndoorScene', {
            width: this.gameWidth,
            height: this.gameHeight,
            locationId: this.touching['door'].target,
            dialogue: this.dialogue,
            quest: this.quest,
            location: this.location,
            inventory: this.inventory,
            // player: this.player,
            item: this.item,
            action: this.action,
            packageDetail: this.packageDetail,
            position: this.position,
            subquest: this.subquest,
            package: this.package,
            choice: this.choice,
            playerProgress: this.playerProgress,
            npcDetail: this.npcDetail,
            locationDetail: this.locationDetail,
        });
    }

    showTalk(player, object) {
        if (!this.collisionHappened) {
            this.touching['npc']=object;
            let activeSubQuest = this.registry.get("activeSubQuest");
            this.children.bringToTop(this.talkButton);
            let positionDetail = this.position.find(position => position.npc === object.tag && position.location_id === this.locationId && (position.subquest_id === activeSubQuest || position.subquest_id === null));
            if (positionDetail) {
                object.position_id = positionDetail.position_id;
                let current_chat = this.dialogue.filter(dialogue => dialogue.position_id === positionDetail.position_id);
                if (current_chat.length>0){
                    this.talkButton.setPosition(object.x - this.talkButton.width / 2,object.y - object.displayHeight/2 - this.talkButton.height - 5)
                    this.talkButton.setText(`Talk to ${object.name}`);
                    this.talkButton.setVisible(true);
                }else{
                    this.talkButton.setVisible(false);
                }
            }
        }
    }

    showEnter(player, object) {
        if (!this.collisionHappened) {
            this.touching['door']=object; //door.name (Your House etc)
            let objectName = object.label;
            this.children.bringToTop(this.enterButton);
            this.enterButton.setPosition(object.x - this.enterButton.width / 2, object.y - object.height/2 - this.enterButton.height - 5);
            this.enterButton.setText(`Enter ${objectName}`);
            this.enterButton.setVisible(true);
        }
    }

    moveNpcTo(npc_tag, targetX, targetY, speed) {
        // Calculate the direction vector
        let npc = this.npc[npc_tag];
        const directionX = targetX - npc.x;
        const directionY = targetY - npc.y;
    
        // Normalize the direction vector
        const magnitude = Math.sqrt(directionX * directionX + directionY * directionY);
        const normalizedX = directionX / magnitude;
        const normalizedY = directionY / magnitude;
    
        // Set velocity based on the direction and speed
        npc.setVelocity(normalizedX * speed, normalizedY * speed);
    
        // Play walking animation based on direction
        // if (Math.abs(normalizedX) > Math.abs(normalizedY)) {
        //     // Horizontal movement
        //     if (normalizedX > 0) {
        //         npc.anims.play('npc_walk_right', true); // Replace with your right-walking animation key
        //     } else {
        //         npc.anims.play('npc_walk_left', true); // Replace with your left-walking animation key
        //     }
        // } else {
        //     // Vertical movement
        //     if (normalizedY > 0) {
        //         npc.anims.play('npc_walk_down', true); // Replace with your down-walking animation key
        //     } else {
        //         npc.anims.play('npc_walk_up', true); // Replace with your up-walking animation key
        //     }
        // }
    
        // Stop movement when the NPC reaches the target
        const checkArrival = this.time.addEvent({
            delay: 50, // Check every 50ms
            callback: () => {
                const distance = Phaser.Math.Distance.Between(npc.x, npc.y, targetX, targetY);
                if (distance < 5) { // Stop when close enough
                    npc.setVelocity(0, 0); // Stop movement
                    npc.anims.stop(); // Stop animation
                    checkArrival.remove(); // Remove the timer
                }
            },
            loop: true
        });
    }

    openInventory(){
        this.inventoryButton.setVisible(false);
        this.collisionHappened = true;

        // Create a semi-transparent background
        this.inventoryBg = this.add.graphics();
        this.inventoryBg.fillStyle(0x000000, 0.8); // Black with 80% opacity
        this.inventoryBg.fillRect(50, 50, this.gameWidth - 100, this.gameHeight - 100); // Adjust size and position
        this.inventoryBg.setScrollFactor(0);

        // Add a title
        this.inventoryTitle = this.add.text(this.gameWidth / 2, 70, 'Inventory', {
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.inventoryTitle.setScrollFactor(0);

        // Display inventory items
        this.inventoryItems = [];
        let startX = 100;
        let startY = 120;
        let itemWidth = 100;
        let itemHeight = 100;
        let itemsPerRow = Math.floor((this.gameWidth - 200) / itemWidth);

        this.inventory.forEach((item, index) => {
            let x = startX + (index % itemsPerRow) * itemWidth;
            let y = startY + Math.floor(index / itemsPerRow) * itemHeight;

            // Add item background
            let itemBg = this.add.graphics();
            itemBg.fillStyle(0xffffff, 1); // White background
            itemBg.fillRect(x, y, itemWidth - 10, itemHeight - 10);
            this.inventoryItems.push(itemBg);

            // Add item text or image
            let itemText = this.add.text(x + 10, y + 10, item.name, {
                fontSize: '16px',
                fill: '#000000'
            });
            this.inventoryItems.push(itemText);
        });

        // Add a close button
        this.closeButton = this.add.image(this.gameWidth - 70, 70, 'close_icon') // Replace 'close_icon' with your image key
        .setScale(0.1) // Scale the image if needed
        .setInteractive() // Make the image clickable
        .on('pointerdown', () => {
            this.closeInventory(); // Close the inventory UI
        });
        this.closeButton.setScrollFactor(0);
    }

    closeInventory() {
        // Destroy all inventory UI elements
        this.inventoryBg.destroy();
        this.inventoryTitle.destroy();
        this.closeButton.destroy();
        this.inventoryItems.forEach(item => item.destroy());
        this.inventoryItems = [];
        this.inventoryButton.setVisible(true);
        this.collisionHappened = false;
    }

    openMenu() {
        // Pause the game
        // this.scene.pause();
        this.collisionHappened = true;
        this.menuButton.setVisible(false);
    
        // Create a semi-transparent background
        // this.menuBg = this.add.graphics();
        // this.menuBg.fillStyle(0x000000, 0.8); // Black with 80% opacity
        // this.menuBg.fillRect(50, 50, this.gameWidth - 100, this.gameHeight - 100); // Adjust size and position
        // this.menuBg.setScrollFactor(0);

        // Add the scroll background as the menu background
        this.menuBg = this.add.image(this.gameWidth / 2, ((this.gameHeight-50) / 2), 'scroll_background')
            // .setOrigin(0.5)
            // .setDisplaySize(this.gameWidth - 100, this.gameHeight - 100); // Adjust size to fit the menu
        this.menuBg.setScrollFactor(0);
        let scrollScale = (this.gameWidth-100)/this.menuBg.width;
        this.menuBg.setScale(scrollScale);
    
        // Add "Game Paused" text
        this.menuTitle = this.add.text(this.gameWidth / 2, this.menuBg.y - (this.menuBg.displayHeight / 8) + 70, 'Game Paused', {
            fontSize: '48px',
            fill: '#000000',
            fontFamily: 'Tagesschrift'
        }).setOrigin(0.5);
        this.menuTitle.setScrollFactor(0);
    
        // Add Resume button
        this.resumeButton = this.add.text(this.gameWidth / 2, this.gameHeight / 2 - 30, 'Resume', {
            fontSize: '32px',
            fill: '#000000',
            // backgroundColor: '#000000',
            fontFamily: 'Tagesschrift',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.closeMenu(); // Resume the game
        });
        this.resumeButton.setScrollFactor(0);
    
        // Add Save & Exit button
        this.saveExitButton = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 50, 'Save & Exit', {
            fontSize: '32px',
            fill: '#000000',
            // backgroundColor: '#000000',
            fontFamily: 'Tagesschrift',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            this.saveAndExit(); // Save the game and exit
        });
        this.saveExitButton.setScrollFactor(0);
    }

    closeMenu() {
        // Resume the game
        // this.scene.resume();
        this.collisionHappened = false;
    
        // Destroy menu UI elements
        this.menuBg.destroy();
        this.menuTitle.destroy();
        this.resumeButton.destroy();
        this.saveExitButton.destroy();
        this.menuButton.setVisible(true);
    }

    saveAndExit() {
        console.log('Game saved! Exiting...');
        // Add your save logic here (e.g., send data to a server or save locally)
    
        // Stop the current scene and go back to the main menu or quit
        this.scene.stop('MainScene');
        this.scene.stop('IndoorScene');
        // Optionally, redirect to a main menu scene if you have one
        // this.scene.start('MainMenu');
        window.location.href = '/CAPSTONE/index.html'; // Redirect to the main menu or home page
    }
}

class Game {
    constructor() {
        // this.dialogue = {}; // Store dialogues from API
        // this.quest = {};
        // this.door = {};
        // this.location = {};
        // this.npc = {};
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
        this.fetchMongo().then(() => {
            this.startGame(); // Start game only after fetching data
        });
    }

    fetchMongo = async () => {
        try {
            const urls = [
                "https://capstone-assignment-36lq.vercel.app/dialogue",
                "https://capstone-assignment-36lq.vercel.app/quest",
                "https://capstone-assignment-36lq.vercel.app/location",
                "https://capstone-assignment-36lq.vercel.app/inventory",
                "https://capstone-assignment-36lq.vercel.app/item",
                '../components/PlayerComponent/game-data/action.json',
                "https://capstone-assignment-36lq.vercel.app/package_detail",
                "https://capstone-assignment-36lq.vercel.app/position",
                "https://capstone-assignment-36lq.vercel.app/subquest",
                "https://capstone-assignment-36lq.vercel.app/package",
                "https://capstone-assignment-36lq.vercel.app/choice",
                "https://capstone-assignment-36lq.vercel.app/player_progress",
                '../components/PlayerComponent/game-data/npc_detail.json',
                '../components/PlayerComponent/game-data/location_detail.json'
            ];

            const responses = await Promise.all(urls.map(url => fetch(url)));
            const [
                dialogue, quest, location,
                inventory, item, action, packageDetail,
                position, subquest, packageData, choice, playerProgress,
                npcDetail, locationDetail
            ] = await Promise.all(responses.map(res => res.json()));

            this.dialogue = dialogue;
            this.quest = quest;
            this.location = location;
            this.inventory = inventory;
            this.item = item;
            this.action = action;
            this.packageDetail = packageDetail;
            this.position = position;
            this.subquest = subquest;
            this.package = packageData;
            this.choice = choice;
            this.playerProgress = playerProgress;
            this.npcDetail = npcDetail;
            this.locationDetail = locationDetail;

            console.log("Fetched dialogue:", dialogue);
            console.log("Fetched quest:", quest);
            console.log("Fetched location:", location);
            console.log("Fetched inventory:", inventory);
            console.log("Fetched item:", item);
            console.log("Fetched action:", action);
            console.log("Fetched packageDetail:", packageDetail);
            console.log("Fetched position:", position);
            console.log("Fetched subquest:", subquest);
            console.log("Fetched package:", packageData);
            console.log("Fetched choice:", choice);
            console.log("Fetched playerProgress:", playerProgress);
            console.log("Fetched npcDetail:", npcDetail);
            console.log("Fetched locationDetail:", locationDetail);
        } catch (error) {
            console.error('Error fetching data from MongoDB:', error);
        }
    };

    startGame() {
        const appContext = useContext(AppContent);

        if (!appContext) {
            throw new Error("AppContent context is undefined");
        }

        const { userData } = appContext;

        console.log("Current User:", userData);

        this.config = {
            type: Phaser.AUTO,
            width: this.gameWidth,
            height: this.gameHeight,
            physics: {
                default: 'arcade',
                arcade: { gravity: { y: 0 }, debug: false }
            },
            scene: [MainScene,IndoorScene]
        };

        this.game = new Phaser.Game(this.config);

        let sceneName = "town";

        // Start MainScene and pass gameWidth, gameHeight, and dialogues
        this.game.scene.start('MainScene', {
            width: this.gameWidth,
            height: this.gameHeight,
            sceneName: sceneName,
            dialogue: this.dialogue,
            quest: this.quest,
            location: this.location,
            inventory: this.inventory,
            player: this.player,
            item: this.item,
            action: this.action,
            packageDetail: this.packageDetail,
            position: this.position,
            subquest: this.subquest,
            package: this.package,
            choice: this.choice,
            playerProgress: this.playerProgress,
            npcDetail: this.npcDetail,
            locationDetail: this.locationDetail
        });
    }
}


// Create the game object with dynamic width & height
const myGame = new Game(); //size wont be use

