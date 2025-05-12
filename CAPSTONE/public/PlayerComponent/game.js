import { Dialog } from './dialog.js';
import { Npc } from './npc.js';
import { Backdrop } from './backdrop.js';
import { Door } from './door.js';
import { IndoorScene } from './indoorScene.js';

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
        this.locationId="0";
        this.player_id="1"; //need change to cookie player
        this.uistatus=0;
        this.inScene=true;
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;
        this.overlapCollider = null;
        // this.gane.scale.resize(this.gameWidth, this.gameHeight);
        this.createLoadingScreen();
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
        this.itemDetail = data.itemDetail || {};
        this.userData = data.userData || {};
        console.log("User Data in MainScene:", this.userData);
        this.player_id = this.userData.id || 1;
        console.log(this.player_id)
    }

    preload() {
        this.load.image("Dungeon_Tileset", "/assets/map_asset/Dungeon_Tileset.png");
        this.load.image("Big_Set", "/assets/map_asset/Big_Set.png");
        this.load.image("Rustic_Indoor", "/assets/map_asset/Rustic_Indoor.png");
        this.load.tilemapTiledJSON("map1", "/assets/map_asset/map1.tmj");
        this.load.tilemapTiledJSON("map2", "/assets/map_asset/map2.tmj");
        this.load.tilemapTiledJSON("map3", "/assets/map_asset/map3.tmj");
        this.load.tilemapTiledJSON("map4", "/assets/map_asset/map4.tmj");
        this.load.tilemapTiledJSON("map5", "/assets/map_asset/map5.tmj");
        this.load.tilemapTiledJSON("map6", "/assets/map_asset/map6.tmj");

        this.load.image('town_bg', '/assets/town_map.jpg');
        this.load.image('town_obstacle', '/assets/town_map_obstacle.png');
        this.load.spritesheet('fighter', '/assets/mc_spritesheet.png', {
            frameWidth: 640,
            frameHeight: 640
        });
        this.load.image("house1_interior", "/assets/house1_interior.png");
        this.load.image("ownhouse_interior", "/assets/ownhouse_interior.jpg");

        this.load.image('inventory_icon', '/assets/inventory_icon.png');
        this.load.image('close_icon', '/assets/close_icon.png');
        this.load.image('menu_icon', '/assets/menu_icon.png');
        this.load.image('guide_icon', '/assets/guide_icon.png');
        this.load.image('resume_icon', '/assets/resume_icon.png');
        this.load.image('exit_icon', '/assets/exit_icon.png');
        this.load.image('scroll_background', '/assets/scroll_background2.png');
        this.load.image('inventory_cat1', '/assets/inventory_cat1.png');
        this.load.image('inventory_cat2', '/assets/inventory_cat2.png');

        for (let [tag, npc] of Object.entries(this.npcDetail)) {
            if (npc.type === "image") {
                this.load.image(tag, `/assets/${npc.img}`);
            } else if (npc.type === "spritesheet") {
                this.load.spritesheet(tag, `/assets/${npc.img}`, {
                    frameWidth: npc.frameSize.width,
                    frameHeight: npc.frameSize.height
                });
            }
        }

        for (let item of Object.values(this.itemDetail)) {
            if (item.tag !== "milestone") {
                this.load.image(item.tag, `/assets/${item.img}`);
            }
        }
    }

    createLoadingScreen() {
        // Create a loading screen container
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'loading-screen';
        this.loadingScreen.style.position = 'fixed';
        this.loadingScreen.style.top = '0';
        this.loadingScreen.style.left = '0';
        this.loadingScreen.style.width = '100%';
        this.loadingScreen.style.height = '100%';
        this.loadingScreen.style.backgroundColor = '#000';
        this.loadingScreen.style.display = 'flex';
        this.loadingScreen.style.flexDirection = 'column';
        this.loadingScreen.style.justifyContent = 'center';
        this.loadingScreen.style.alignItems = 'center';
        this.loadingScreen.style.zIndex = '1000';

        // Add the logo
        const logo = document.createElement('img');
        logo.src = '/assets/logo.png'; // Path to the logo image
        logo.alt = 'Game Logo';
        logo.className = 'logo'; // Add the 'logo' class for animation
        // logo.style.width = '150px'; // Adjust the size of the logo
        // logo.style.marginBottom = '20px'; // Add spacing below the logo
        this.loadingScreen.appendChild(logo);

        // Add a spinner
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.style.width = '60px';
        spinner.style.height = '60px';
        spinner.style.border = '5px solid #4E2900';
        spinner.style.borderTop = '5px solid #ff8800';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1s ease-in-out infinite';
        this.loadingScreen.appendChild(spinner);

        // Add loading text
        this.loadingText = document.createElement('p');
        this.loadingText.textContent = 'Loading your adventure...';
        this.loadingText.style.color = '#fff';
        // this.loadingText.style.fontSize = '20px';
        // this.loadingText.style.marginTop = '20px';
        this.loadingScreen.appendChild(this.loadingText);

        // Append the loading screen to the body
        document.body.appendChild(this.loadingScreen);

        // Add spinner animation
        const style = document.createElement('style');
        style.innerHTML = `
            .logo {
                max-width: 200px;
                animation: pulse 2s infinite;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @keyframes pulse {
                0% {
                    opacity: 0.8;
                    transform: scale(0.95);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                }
                100% {
                    opacity: 0.8;
                    transform: scale(0.95);
                }
            }
        `;
        document.head.appendChild(style);
    }

    updateLoadingScreen(percentage) {
        // Update the loading text with the percentage
        this.loadingText.textContent = `Loading... ${percentage}%`;
    }

    removeLoadingScreen() {
        // Remove the loading screen from the DOM
        if (this.loadingScreen) {
            document.body.removeChild(this.loadingScreen);
        }
    }

    create() {
        //set initial quest and subquest in the beginning
        //use registry to store data across all scenes
        // let activeQuest = 1;
        // let activeSubQuest = this.quest[activeQuest].startquest;
        let activeSubQuest = this.playerProgress.find(progress => progress.player_id === this.player_id).subquest_id;
        console.log(activeSubQuest);
        let activeQuest = this.subquest.find(subquest => subquest.subquest_id === activeSubQuest).quest_id;
        console.log(activeQuest);

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

        //player (fighter)
        this.player = this.physics.add.sprite(this.gameWidth / 2, this.gameHeight / 2, 'fighter');
        this.player.setScale(0.1);

        //import npc
        this.spawnNpc();

        //background obstacle
        this.backdrop['obstacle'] = new Backdrop(this, 0, 0, 'town_obstacle', this.zoomFactor);

        // Create a static group for barriers
        this.barrierGroup = this.physics.add.staticGroup();

        // Manual rectangle obstacles (replace collision mask logic)
        // Format: [x, y, width, height]
        const manualObstacles = [
            [0, 0, 1280, 4],
            [948, 36, 25, 5],
            [1004, 121, 176, 5],
            [736, 135, 11, 5],
            [429, 137, 24, 5],
            [74, 139, 24, 5],
            [249, 162, 24, 5],
            [547, 224, 25, 5],
            [59, 226, 157, 5],
            [311, 229, 158, 5],
            [1118, 252, 25, 5],
            [494, 266, 133, 5],
            [717, 266, 133, 5],
            [906, 289, 158, 5],
            [256, 296, 11, 5],
            [724, 359, 25, 5],
            [1085, 361, 11, 5],
            [281, 410, 25, 5],
            [649, 423, 47, 5],
            [1151, 437, 25, 5],
            [129, 451, 25, 5],
            [417, 451, 25, 5],
            [249, 521, 158, 5],
            [873, 540, 292, 5],
            [480, 592, 25, 5],
            [786, 603, 25, 5],
            [187, 612, 24, 5],
            [194, 624, 12, 5],
            [1179, 624, 11, 5],
            [419, 625, 208, 10],
            [731, 625, 133, 10],
            [247, 772, 24, 5],
            [544, 772, 24, 5],
            [952, 774, 24, 5],
            [0, 784, 1280, 4],
            // Additional rectangles (x, y, w, h)
            [0, 0, 591, 96],
            [747, 0, 146, 96],
            [1220, 0, 193, 616],
            [1080, 240, 140, 100],
            [1009, 112, 171, 34],
            [57, 218, 154, 34],
            [312, 223, 153, 34],
            [906, 283, 154, 34],
            [0, 421, 199, 166],
            [873, 533, 287, 48],
            [250, 538, 153, 33],
            [0, 750, 1160, 96],
            [0,0,20,420],
            [0,0,30,788],
            [0,587,120,50]
        ];

        // Draw obstacles and add to physics
        for (const [x, y, w, h] of manualObstacles) {
            // Scale all values by zoomFactor
            const sx = x * this.zoomFactor;
            const sy = y * this.zoomFactor;
            const sw = w * this.zoomFactor;
            const sh = h * this.zoomFactor;

            // Create invisible static body for collision
            let barrier = this.barrierGroup.create(sx + sw / 2, sy + sh / 2, null);
            barrier.body.setSize(sw, sh);
            barrier.setVisible(false);
        }

        // Add collision between player and barriers
        this.physics.add.collider(this.player, this.barrierGroup);

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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            font: `${this.gameWidth*0.02}px 'Jersey 10'`,
            padding: {
                left: 20,  // Set left padding
                right: 20, // Set right padding
                top: 10,    // Set top padding to 0
                bottom: 10   // Set bottom padding to 0
            },
        })
        .setInteractive() // Make the text clickable
        .setLetterSpacing(2)
        .on('pointerdown', () => {
            this.talk();
        });
        this.talkButton.setVisible(false);

        //Enter house button
        this.enterButton = this.add.text(this.gameWidth/2+50, this.gameHeight/2-50, 'Enter house', {
            // fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            font: `${this.gameWidth*0.02}px 'Jersey 10'`,
            padding: {
                left: 20,  // Set left padding
                right: 20, // Set right padding
                top: 10,    // Set top padding to 0
                bottom: 10   // Set bottom padding to 0
            },
        })
        .setInteractive() // Make the text clickable
        .setLetterSpacing(2)
        .on('pointerdown', () => {
            this.enterDoor();
        });
        this.enterButton.setVisible(false);

        // Create a guide button
        this.guideButton = this.add.image(this.gameWidth*0.82, this.gameWidth*0.04, 'guide_icon')
            .setScale(this.gameWidth/2e4) // Scale the image if needed
            .setInteractive() // Make the image clickable
            .on('pointerdown', () => {
                this.openGuide(); // Call the menu function when clicked
            });
        this.guideButton.setScrollFactor(0);

        // Ensure the button stays on top
        this.children.bringToTop(this.guideButton);

        // Create a inventory
        this.inventoryButton = this.add.image(this.gameWidth*0.89, this.gameWidth*0.04, 'inventory_icon')
            .setScale(this.gameWidth/2e4) // Scale the image if needed
            .setInteractive() // Make the image clickable
            .on('pointerdown', () => {
                this.openInventory(); // Call the menu function when clicked
            });
        this.inventoryButton.setScrollFactor(0);

        // Ensure the button stays on top
        this.children.bringToTop(this.inventoryButton);

        //Menu button
        this.menuButton = this.add.image(this.gameWidth*0.96, this.gameWidth*0.04, 'menu_icon')
            .setScale(this.gameWidth/2e4) // Scale the image if needed
            .setInteractive() // Make the image clickable
            .on('pointerdown', () => {
                this.openMenu(); // Call the menu function when clicked
            });
        this.menuButton.setScrollFactor(0);

        // Ensure the button stays on top
        this.children.bringToTop(this.menuButton);

        //Collision listener
        this.npcList = Object.values(this.npc);
        // this.physics.add.overlap(this.player, this.npcList, this.showTalk, null, this);
        this.doorList = Object.values(this.doors);
        this.physics.add.overlap(this.player, this.doorList, this.showEnter, null, this);

        //Initial position of the player
        if (this.userData.location_id !== this.locationId) {
            let entrancePos = this.location.find(location => location.location_id === this.userData.location_id).entrance_position;
            let playerStartPosX = (entrancePos.x1+entrancePos.x2)/2 * this.zoomFactor;
            let playerStartPosY = (entrancePos.y1+entrancePos.y2)/2 * this.zoomFactor;
            this.player.setPosition(playerStartPosX,playerStartPosY);
            this.inScene=false;
            this.scene.switch('IndoorScene', {
                width: this.gameWidth,
                height: this.gameHeight,
                locationId: this.userData.location_id,
                dialogue: this.dialogue,
                quest: this.quest,
                location: this.location,
                inventory: this.inventory,
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
                itemDetail: this.itemDetail,
                player_id : this.player_id,
                coordinates: this.userData.coordinates
            });
        }else{
            let spawnPos = this.userData.coordinates;
            let playerStartPosX = spawnPos.x * this.zoomFactor;
            let playerStartPosY = spawnPos.y * this.zoomFactor;
            this.player.setPosition(playerStartPosX,playerStartPosY);
            console.log(`Player Start Position: (${playerStartPosX}, ${playerStartPosY})`);
        }

        //detect back to mainscene from indoor scene
        this.events.on("wake", () => {
            this.inScene=true;
            console.log("MainScene Resumed");
            console.log(this.registry.get("activeQuest"));
            console.log(this.registry.get("activeSubQuest"));
            this.spawnNpc();
            // this.physics.add.overlap(this.player, this.npcList, this.showTalk, null, this);
        });

        // this.cameras.main.setZoom(zoomFactor);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.current_bg.width*this.zoomFactor, this.current_bg.height*this.zoomFactor);
        this.physics.world.setBounds(0, 0, this.current_bg.width*this.zoomFactor, this.current_bg.height*this.zoomFactor);

        // this.physics.world.setBounds(this.current_bg.width*this.zoomFactor*-1, this.current_bg.height*this.zoomFactor*-1, this.current_bg.width*this.zoomFactor, this.current_bg.height*this.zoomFactor);
        this.player.setCollideWorldBounds(true); // Prevent the player from moving outside the bounds
        // this.movementSpeed = this.movementSpeed/zoomFactor;

        this.removeLoadingScreen();

        this.checkNarrator();

        setInterval(() => {this.saveLocation()}, 5000);
    }

    update() {
        console.log("Player Position:", this.player.x/this.zoomFactor, this.player.y/this.zoomFactor);
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

    checkNarrator(){
        let subquestPosition = this.position.find(position => position.subquest_id === this.registry.get("activeSubQuest") && position.npc==="narrator");
        if (subquestPosition){
            let chats = this.dialogue.filter(dialogue => dialogue.position_id === subquestPosition.position_id);
            chats.sort((a, b) => Number(a.dialogue_id) - Number(b.dialogue_id));
            // Sort chats by numeric part of dialogue_id (e.g., D01, D02, ..., D11)
            // chats.sort((a, b) => {
            // const numA = Number(a.dialogue_id.replace(/\D/g, ""));
            // const numB = Number(b.dialogue_id.replace(/\D/g, ""));
            // return numA - numB;
            // });
            if (chats.length==0){
                return;
            }
            this.collisionHappened = true;
            console.log(chats);
            let dialog = new Dialog(this,chats);
            dialog.showDialogs();
        }
    }

    saveLocation() {
        if (!this.inScene){
            return;
        }
        const currentX = this.player.x/this.zoomFactor; // Assuming your player's x position
        const currentY = this.player.y/this.zoomFactor; // Assuming your player's y position
        const locationId = this.locationId; // Your custom function to get location ID
    
        fetch('https://capstone-assignment-36lq.vercel.app/api/user/update-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: this.player_id,
            location_id: locationId,
            x: currentX,
            y: currentY,
          }),
        })
        .then(res => res.json())
        .then(data => {
        //   console.log('Location updated:', data);
        })
        .catch(err => {
          console.error('Error updating location:', err);
        });
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
        console.log("Npc positions:",posData);

        for (let pos of posData){ //loop through all npc
            let coordinate = pos.coordinates;
            let tag = pos.npc;
            console.log(tag);
            let npcData = this.npcDetail[tag];
            console.log(npcData);
            this.npc[tag] = new Npc(this, coordinate.x, coordinate.y, tag, npcData.name, npcData.scale);
            if (npcData.animation){
                for (let [key,anim] of Object.entries(npcData.animation)){
                    if (!this.anims.exists(tag+key)){
                        this.anims.create({
                            key: tag+key,
                            frames: this.anims.generateFrameNumbers(tag, { start: anim.startFrame, end: anim.endFrame }),
                            frameRate: anim.frameRate, // Adjust speed (frames per second)
                            repeat: anim.repeat // -1 = Loop infinitely
                        });
                    }
                }
                this.npc[tag].setFrame(npcData.initialFrame);
                this.npc[tag].play(tag+"idle");
            }
        }
        this.children.bringToTop(this.player);
        this.children.bringToTop(this.backdrop['obstacle']);
        this.children.bringToTop(this.guideButton);
        this.children.bringToTop(this.inventoryButton);
        this.children.bringToTop(this.menuButton);
        this.npcList = Object.values(this.npc);
        this.npcOverlap = this.physics.add.overlap(this.player, this.npcList, this.showTalk, null, this);
    }

    talk() {
        this.talkButton.setVisible(false);
        this.collisionHappened = true;
        let object = this.touching['npc'];
        console.log(`Talking to the ${object.name}...`);
        let chats = this.dialogue.filter(dialogue => dialogue.position_id === object.position_id);
        chats.sort((a, b) => Number(a.dialogue_id) - Number(b.dialogue_id));
        console.log(chats);
        let dialog1 = new Dialog(this,chats);
        dialog1.showDialogs();
    }

    enterDoor() {
        this.enterButton.setVisible(false);
        let objectName = this.touching['door'].label;
        console.log(`Entering ${objectName}...`);
        this.inScene=false;

        //switch to indoor scene without pausing or shutdown MainScene
        this.scene.switch('IndoorScene', {
            width: this.gameWidth,
            height: this.gameHeight,
            locationId: this.touching['door'].target,
            dialogue: this.dialogue,
            quest: this.quest,
            location: this.location,
            inventory: this.inventory,
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
            itemDetail: this.itemDetail,
            player_id : this.player_id
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

    moveNpcTo(npc_tag, targetX, targetY, speed, destroy=false) {
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

        if (destroy){
            this.npc[npc_tag].destroy();
        }
    }

    openGuide() {
        if (this.uistatus != 0 || this.collisionHappened) {
            return;
        }
        this.uistatus = 1;
        this.collisionHappened = true;
    
        // Create a semi-transparent dark overlay
        this.darkOverlayGuide = this.add.graphics();
        this.darkOverlayGuide.fillStyle(0x000000, 0.5); // Black with 50% opacity
        this.darkOverlayGuide.fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.darkOverlayGuide.setScrollFactor(0);
    
        // Add the scroll background as the guide background
        this.guideBg = this.add.image(this.gameWidth / 2, ((this.gameHeight-30) / 2), 'scroll_background');
        this.guideBg.setScrollFactor(0);
        let scrollScale = (this.gameWidth - 50) / this.guideBg.width;
        this.guideBg.setScale(scrollScale);
    
        // Guide title
        this.guideTitle = this.add.text(this.gameWidth / 2, (this.guideBg.y - this.guideBg.displayHeight * 0.0875), 'GUIDE', {
            fill: '#000000',
            font: `${this.guideBg.displayWidth*0.07}px 'Jersey 10'`,
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.guideTitle.setScrollFactor(0);
        this.guideTitle.setLetterSpacing(2);

        // Add guide content
        let activeSubQuest = this.registry.get("activeSubQuest");
        let guideText = this.subquest.find(subquest => subquest.subquest_id === activeSubQuest).title;
        this.guideContent = this.add.text(this.gameWidth / 2, this.guideBg.y*1.05, guideText,
            {
                fill: '#000000',
                align: 'center',
                wordWrap: { width: this.guideBg.displayWidth * 0.7 },
                font: `${this.guideBg.displayWidth*0.03}px 'VT323'`
            }).setOrigin(0.5);
        this.guideContent.setScrollFactor(0);
        this.guideContent.setLetterSpacing(0);

        // Add a close button
        this.closeGuideButton = this.add.image(this.gameWidth * 0.81, this.gameHeight * 0.3, 'close_icon') // Replace 'close_icon' with your image key
            .setScale(this.gameWidth / 2e4) // Scale the image if needed
            .setInteractive() // Make the image clickable
            .on('pointerdown', () => {
                this.closeGuide(); // Close the guide UI
            });
        this.closeGuideButton.setScrollFactor(0);
    }

    closeGuide() {
        // Destroy all guide UI elements
        this.darkOverlayGuide.destroy();
        this.guideBg.destroy();
        this.guideTitle.destroy();
        this.guideContent.destroy();
        this.closeGuideButton.destroy();
    
        this.collisionHappened = false;
        this.uistatus = 0;
    }

   async openInventory(){
        if (this.uistatus!=0 || this.collisionHappened){
            return;
        }

        this.uistatus=1;
        this.collisionHappened = true;
        let displayCat = 0;

        // Create a semi-transparent dark overlay
        this.darkOverlay = this.add.graphics();
        this.darkOverlay.fillStyle(0x000000, 0.5); // Black with 50% opacity
        this.darkOverlay.fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.darkOverlay.setScrollFactor(0);

        // Add the scroll background as the menu background
        this.inventoryBg = this.add.image(this.gameWidth / 2, ((this.gameHeight-30) / 2), 'scroll_background')
        this.inventoryBg.setScrollFactor(0);
        let scrollScale = (this.gameWidth-50)/this.inventoryBg.width;
        this.inventoryBg.setScale(scrollScale);

        // Add a title
        this.inventoryTitle = this.add.text(this.gameWidth / 2, (this.inventoryBg.y - this.inventoryBg.displayHeight * 0.1), 'INVENTORY', {
            // fontSize: `${this.inventoryBg.displayWidth*0.03}px`,
            fontStyle: 'bold',
            fill: '#000000',
            font: `${this.inventoryBg.displayWidth*0.06}px 'Jersey 10'`
        }).setOrigin(0.5);
        this.inventoryTitle.setScrollFactor(0);
        this.inventoryTitle.setLetterSpacing(4);

        // Display inventory items
        this.inventoryItems = [];

        // Add category slots on the left
        let categoryLength = this.inventoryBg.displayWidth*0.05;
        let categoryGap = this.inventoryBg.displayHeight * 0.02;
        let categoryStartX = this.gameWidth*0.3;
        let categoryStartY = this.inventoryBg.y*1.3 - categoryLength*1.5 - categoryGap;

        // Category 1
        let category1 = this.add.graphics();
        category1.fillStyle(0xC48441, 1); // Light blue color
        category1.fillRect(categoryStartX - categoryLength / 2, categoryStartY - categoryLength / 2, categoryLength, categoryLength);
        category1.setInteractive(new Phaser.Geom.Rectangle(categoryStartX - categoryLength / 2, categoryStartY - categoryLength / 2, categoryLength, categoryLength), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                console.log('Category 1 clicked');
                displayCat = 0;
                this.showCatItem(displayCat);

                // Change color of Category 1
                category1.clear(); // Clear the previous graphics
                category1.fillStyle(0xC48441, 1); // New color (Gold)
                category1.fillRect(categoryStartX - categoryLength / 2, categoryStartY - categoryLength / 2, categoryLength, categoryLength);

                // Reset Category 2 color
                category2.clear();
                category2.fillStyle(0xDEB369, 1); // Reset to original color
                category2.fillRect(categoryStartX - categoryLength / 2, categoryStartY + categoryLength + categoryGap - categoryLength / 2, categoryLength, categoryLength);
            });
        category1.setScrollFactor(0);
        this.inventoryItems.push(category1);

        // Add an image inside Category 1
        let category1Image = this.add.image(categoryStartX, categoryStartY, 'inventory_cat1') // Replace 'weapons_icon' with your image key
        .setDisplaySize(categoryLength * 0.8, categoryLength * 0.8); // Scale the image to fit the box
        category1Image.setScrollFactor(0);
        this.inventoryItems.push(category1Image);

        // Category 2
        let category2 = this.add.graphics();
        category2.fillStyle(0xDEB369, 1); // Light green color
        category2.fillRect(categoryStartX - categoryLength / 2, categoryStartY + categoryLength + categoryGap - categoryLength / 2, categoryLength, categoryLength);
        category2.setInteractive(new Phaser.Geom.Rectangle(categoryStartX - categoryLength / 2, categoryStartY + categoryLength + categoryGap - categoryLength / 2, categoryLength, categoryLength), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                console.log('Category 2 clicked');
                displayCat = 1;
                this.showCatItem(displayCat);

                // Change color of Category 2
                category2.clear(); // Clear the previous graphics
                category2.fillStyle(0xC48441, 1); // New color (Gold)
                category2.fillRect(categoryStartX - categoryLength / 2, categoryStartY + categoryLength + categoryGap - categoryLength / 2, categoryLength, categoryLength);

                // Reset Category 1 color
                category1.clear();
                category1.fillStyle(0xDEB369, 1); // Reset to original color
                category1.fillRect(categoryStartX - categoryLength / 2, categoryStartY - categoryLength / 2, categoryLength, categoryLength);
            });
        category2.setScrollFactor(0);
        this.inventoryItems.push(category2);

        // Add an image inside Category 2
        let category2Image = this.add.image(categoryStartX, categoryStartY + categoryLength + categoryGap, 'inventory_cat2') // Replace 'potions_icon' with your image key
            .setDisplaySize(categoryLength * 0.8, categoryLength * 0.8); // Scale the image to fit the box
        category2Image.setScrollFactor(0);
        this.inventoryItems.push(category2Image);

        this.showCatItem(displayCat);

        // Add a close button
        this.closeButton = this.add.image(this.gameWidth *0.81, this.gameHeight *0.3, 'close_icon') // Replace 'close_icon' with your image key
        .setScale(this.gameWidth/2e4) // Scale the image if needed
        .setInteractive() // Make the image clickable
        .on('pointerdown', () => {
            this.closeInventory(); // Close the inventory UI
        });
        this.closeButton.setScrollFactor(0);

        await this.refreshInventory();
    }

    showCatItem(catType=0){
        let catItemType = [];
        if (catType==0){
            catItemType = ['quest','point'];
        }else{
            catItemType = ['badge'];
        }

        let playerInventory = this.inventory.filter(item => item.player_id === this.player_id);

        let filteredInventory = playerInventory.filter(inventoryItem => {
            let itemDetails = this.item.find(item => item.item_id === inventoryItem.item_id); // Access item details from this.item
            return itemDetails && catItemType.includes(itemDetails.type); // Check if the type matches
        });

        let itemLength = this.inventoryBg.displayWidth*0.045;
        let itemGapX = this.inventoryBg.displayWidth*0.02;
        let itemGapY = this.inventoryBg.displayHeight*0.008;
        let startX = this.gameWidth*0.4;
        let startY = this.inventoryBg.y*1.1 - itemLength*1.5 - itemGapY;
        // let itemsPerRow = Math.floor((this.gameWidth - 200) / itemWidth);
        let itemsPerRow = 5;
        let totalSlots = 15; // Fixed number of slots

        for (let i = 0; i < totalSlots; i++) {
            let x = startX + (i % itemsPerRow) * (itemLength+itemGapX);
            let y = startY + Math.floor(i / itemsPerRow) * (itemLength+itemGapY);
    
            // Add a square for the slot
            let itemBg = this.add.graphics();
            itemBg.fillStyle(0xDEB369, 1); // White background
            itemBg.fillRect(x, y, itemLength, itemLength);
            itemBg.setScrollFactor(0);
            this.inventoryItems.push(itemBg);
    
            // If there's an item for this slot, display it
            if (i < filteredInventory.length) {
                let item = filteredInventory[i];
                if (item.amount>0){
                    let itemId = item.item_id;
                    let itemDetails = this.itemDetail[itemId];

                    // Add the item image
                    let itemImage = this.add.image(x + itemLength / 2, y + itemLength / 2, itemDetails.tag)
                        .setDisplaySize(itemLength * 0.8, itemLength * 0.8); // Scale the image to fit the slot
                    itemImage.setScrollFactor(0);
                    this.inventoryItems.push(itemImage);
        
                    if (item.amount>1){
                        // item amount display on top right of each item
                        let itemText = this.add.text(x + itemLength - 2, y + 2, item.amount, {
                            fontSize: `${itemLength*0.3}px`,
                            fontStyle: 'bold',
                            fill: '#000000'
                        });
                        itemText.setOrigin(1, 0);
                        itemText.setScrollFactor(0);
                        this.inventoryItems.push(itemText);
                    }
                }
                
                
            }
        }
    }

    closeInventory() {
        // Destroy all inventory UI elements
        this.darkOverlay.destroy();
        this.inventoryBg.destroy();
        this.inventoryTitle.destroy();
        this.closeButton.destroy();
        this.inventoryItems.forEach(item => item.destroy());
        this.inventoryItems = [];
        this.inventoryButton.setVisible(true);
        this.collisionHappened = false;
        this.uistatus=0;
    }

    async refreshInventory() {
        try {
            const response = await fetch("https://capstone-assignment-36lq.vercel.app/inventory");
            if (!response.ok) {
                throw new Error("Failed to fetch inventory");
            }
            const inventory = await response.json();
            this.inventory = inventory;
        } catch (error) {
            console.error("Error fetching inventory:", error);
        }
    }

    openMenu() {
        if (this.uistatus!=0 || this.collisionHappened){
            return;
        }
        this.uistatus=1;
        this.collisionHappened = true;

        // Create a semi-transparent dark overlay
        this.darkOverlay2 = this.add.graphics();
        this.darkOverlay2.fillStyle(0x000000, 0.5); // Black with 50% opacity
        this.darkOverlay2.fillRect(0, 0, this.gameWidth, this.gameHeight);
        this.darkOverlay2.setScrollFactor(0);

        // Add the scroll background as the menu background
        this.menuBg = this.add.image(this.gameWidth / 2, ((this.gameHeight-30) / 2), 'scroll_background')
            // .setOrigin(0.5)
            // .setDisplaySize(this.gameWidth - 100, this.gameHeight - 100); // Adjust size to fit the menu
        this.menuBg.setScrollFactor(0);
        let scrollScale = (this.gameWidth-50)/this.menuBg.width;
        this.menuBg.setScale(scrollScale);
    
        // Add "Game Paused" text
        this.menuTitle = this.add.text(this.gameWidth / 2, (this.menuBg.y - this.menuBg.displayHeight * 0.0875), 'GAME PAUSED', {
            fill: '#000000',
            font: `${this.menuBg.displayWidth*0.07}px 'Jersey 10'`
        }).setOrigin(0.5);
        this.menuTitle.setScrollFactor(0);
        this.menuTitle.setLetterSpacing(2);

        // Add Resume button as an image
        this.resumeButton = this.add.image(this.gameWidth / 2, this.gameHeight * 0.48, 'resume_icon') // Replace 'resume_icon' with your image key
        .setScale(this.gameWidth / 8e3) // Scale the image if needed
        .setInteractive()
        .on('pointerdown', () => {
            this.closeMenu(); // Resume the game
        });
    this.resumeButton.setScrollFactor(0);

    // Add Save & Exit button as an image
    this.saveExitButton = this.add.image(this.gameWidth / 2, this.gameHeight * 0.63, 'exit_icon') // Replace 'exit_icon' with your image key
        .setScale(this.gameWidth / 8e3) // Scale the image if needed
        .setInteractive()
        .on('pointerdown', () => {
            this.saveAndExit(); // Save the game and exit
        });
    this.saveExitButton.setScrollFactor(0);
    }

    closeMenu() {
        // Destroy menu UI elements
        this.darkOverlay2.destroy();
        this.menuBg.destroy();
        this.menuTitle.destroy();
        this.resumeButton.destroy();
        this.saveExitButton.destroy();
        this.menuButton.setVisible(true);

        this.collisionHappened = false;
        this.uistatus=0;
    }

    saveAndExit() {
        console.log('Game saved! Exiting...');    
        this.saveLocation();
        this.scene.stop('MainScene');
        this.scene.stop('IndoorScene');
        window.location.href = '/'; // Redirect to the main menu or home page
    }

    resizeGame() {
        this.gameWidth = window.innerWidth;
        this.gameHeight = window.innerHeight;

        //this.game.config.width = this.gameWidth;
        //this.game.config.height = this.gameHeight;
            this.game.scale.resize(this.gameWidth, this.gameHeight);

        this.game.scene.getScenes().forEach(scene => {
            if (scene.scene.key === 'MainScene' || scene.scene.key === 'IndoorScene') { //check if scene is MainScene or IndoorScene
            scene.cameras.main.resize(this.gameWidth, this.gameHeight);
            scene.scale.updateScale(this.gameWidth, this.gameHeight);
            // Update the game config
            this.game.config.width = this.gameWidth;
            this.game.config.height = this.gameHeight;

            // Manually resize the renderer
            this.game.renderer.resize(this.gameWidth, this.gameHeight);
            }
        });
    }
}

class Game {
  constructor() {
    this.userData = {};

    this.gameWidth = window.innerWidth;
    this.gameHeight = window.innerHeight;
    this.initGame();
  }

  async initGame() {
    try {
      this.createLoadingScreen();

      // Wait for fetchUserData to complete
      await this.fetchUserData();

      // Wait for fetchMongo to complete
      await this.fetchMongo();

      // Start the game after all data is fetched
      this.startGame();
    } catch (error) {
      console.error("Error initializing the game:", error);
    }
  }

  createLoadingScreen() {
    // Create a loading screen container
    this.loadingScreen = document.createElement("div");
    this.loadingScreen.id = "loading-screen";
    this.loadingScreen.style.position = "fixed";
    this.loadingScreen.style.top = "0";
    this.loadingScreen.style.left = "0";
    this.loadingScreen.style.width = "100%";
    this.loadingScreen.style.height = "100%";
    this.loadingScreen.style.backgroundColor = "#000";
    this.loadingScreen.style.display = "flex";
    this.loadingScreen.style.flexDirection = "column";
    this.loadingScreen.style.justifyContent = "center";
    this.loadingScreen.style.alignItems = "center";
    this.loadingScreen.style.zIndex = "1000";

    // Add the logo
    const logo = document.createElement("img");
    logo.src = "/assets/logo.png"; // Path to the logo image
    logo.alt = "Game Logo";
    logo.className = "logo"; // Add the 'logo' class for animation
    // logo.style.width = '150px'; // Adjust the size of the logo
    // logo.style.marginBottom = '20px'; // Add spacing below the logo
    this.loadingScreen.appendChild(logo);

    // Add a spinner
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    spinner.style.width = "60px";
    spinner.style.height = "60px";
    spinner.style.border = "5px solid #4E2900";
    spinner.style.borderTop = "5px solid #ff8800";
    spinner.style.borderRadius = "50%";
    spinner.style.animation = "spin 1s ease-in-out infinite";
    this.loadingScreen.appendChild(spinner);

    // Add loading text
    this.loadingText = document.createElement("p");
    this.loadingText.textContent = "Loading your adventure...";
    this.loadingText.style.color = "#fff";
    // this.loadingText.style.fontSize = '20px';
    // this.loadingText.style.marginTop = '20px';
    this.loadingScreen.appendChild(this.loadingText);

    // Append the loading screen to the body
    document.body.appendChild(this.loadingScreen);

    // Add spinner animation
    const style = document.createElement("style");
    style.innerHTML = `
            .logo {
                max-width: 200px;
                animation: pulse 2s infinite;
            }

            @keyframes spin {
                to {
                    transform: rotate(360deg);
                }
            }

            @keyframes pulse {
                0% {
                    opacity: 0.8;
                    transform: scale(0.95);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                }
                100% {
                    opacity: 0.8;
                    transform: scale(0.95);
                }
            }
        `;
    document.head.appendChild(style);
  }

  updateLoadingScreen(percentage) {
    // Update the loading text with the percentage
    this.loadingText.textContent = `Loading... ${percentage}%`;
  }

  removeLoadingScreen() {
    // Remove the loading screen from the DOM
    if (this.loadingScreen) {
      document.body.removeChild(this.loadingScreen);
    }
  }

  fetchMongo = async () => {
    try {
      const urls = [
        "https://capstone-assignment-36lq.vercel.app/dialogue",
        "/PlayerComponent/game-data/quest.json",
        "https://capstone-assignment-36lq.vercel.app/location",
        "https://capstone-assignment-36lq.vercel.app/inventory", //"/PlayerComponent/game-data/inventory_sample.json",
        "https://capstone-assignment-36lq.vercel.app/item", // "/PlayerComponent/game-data/item_sample.json",
        "/PlayerComponent/game-data/action.json",
        "https://capstone-assignment-36lq.vercel.app/package_detail",
        "https://capstone-assignment-36lq.vercel.app/position",
        "https://capstone-assignment-36lq.vercel.app/subquest",
        "https://capstone-assignment-36lq.vercel.app/package",
        "https://capstone-assignment-36lq.vercel.app/choice",
        "https://capstone-assignment-36lq.vercel.app/player-progress",
        "/PlayerComponent/game-data/npc_detail.json",
        "/PlayerComponent/game-data/location_detail.json",
        "/PlayerComponent/game-data/item_detail.json",
      ];

      const responses = await Promise.all(urls.map((url) => fetch(url)));
      const [
        dialogue,
        quest,
        location,
        inventory,
        item,
        action,
        packageDetail,
        position,
        subquest,
        packageData,
        choice,
        playerProgress,
        npcDetail,
        locationDetail,
        itemDetail,
      ] = await Promise.all(responses.map((res) => res.json()));

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
      this.itemDetail = itemDetail;

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
      console.log("Fetched itemDetail:", itemDetail);
    } catch (error) {
      console.error("Error fetching data from MongoDB:", error);
    }
  };

  async fetchUserData() {
    try {
      const email = localStorage.getItem('userEmail');
      console.log(email);

      const response = await fetch(
        "https://capstone-assignment-36lq.vercel.app/api/user/data",
        {
          method: "POST", // Use POST method
          headers: {
            "Content-Type": "application/json", // Specify JSON content type
          },
          body: JSON.stringify({
            email: email,
          }), // Convert the payload to JSON
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      this.userData = await response.json(); // Parse the JSON response
      this.userData = this.userData.userData;
      console.log("Fetched User Data:", this.userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null; // Return null if fetching fails
    }
  }

  startGame() {
    console.log("Starting game with user data:", this.userData);

    this.removeLoadingScreen();

    this.config = {
      type: Phaser.AUTO,
      width: this.gameWidth,
      height: this.gameHeight,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: true },
      },
      scene: [MainScene, IndoorScene],
    };

    this.game = new Phaser.Game(this.config);

    let sceneName = "town";

    // Start MainScene and pass gameWidth, gameHeight, and dialogues
    this.game.scene.start("MainScene", {
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
      locationDetail: this.locationDetail,
      itemDetail: this.itemDetail,
      userData: this.userData,
    });
  }
}

// Create the game object with dynamic width & height
const myGame = new Game(); //size wont be use

