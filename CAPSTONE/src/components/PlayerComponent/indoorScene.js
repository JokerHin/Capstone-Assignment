import { Dialog } from './dialog.js';
import { Backdrop } from './backdrop.js';
import { Door } from './door.js';
import { Npc } from './npc.js';



export class IndoorScene extends Phaser.Scene {
    constructor() {
        super({ key: "IndoorScene" }); // Scene key
        this.collisionHappened = false
        this.touching={'door':null,'npc':null};
        this.npc={};
        this.backdrop={};
        this.doors={};
        this.player_direction=-1;
        this.current_bg={};
        this.gameposx=140;
        this.gameposy=260;
        this.movementSpeed=200;
        this.zoomFactor = 6;
        this.player_id=1;
        this.uistatus=0;
    }

    init(data) {
        this.gameWidth = data.width;
        this.gameHeight = data.height;
        this.locationId = data.locationId;
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
    }

    preload() {

    }

    create() {
        console.log("Entered House Interior");
        let indoorDetail = this.locationDetail[this.locationId];
        console.log(this.locationId);
        console.log(indoorDetail);
        this.cameras.main.setBackgroundColor(indoorDetail.bgcolor);
        this.current_bg.scale = this.zoomFactor;

        //Create player sprite
        this.player = this.physics.add.sprite(this.gameWidth / 2, this.gameHeight / 2, 'fighter');

        // Set a smaller hitbox for the player
        let hitboxWidth = 640;  // Adjust width of the hitbox
        let hitboxHeight = 640; // Adjust height of the hitbox
        let offsetX = 0;      // Horizontal offset
        let offsetY = 0;      // Vertical offset
        this.player.body.setSize(hitboxWidth, hitboxHeight).setOffset(offsetX, offsetY);


        //import tilemap
        const map = this.make.tilemap({ key: indoorDetail.map });
        const tileset = map.addTilesetImage(indoorDetail.name, indoorDetail.tileset); //Change in tmj file Line 259
        let mapLayers = map.layers;
        for (let i = 0; i < mapLayers.length; i++) {
            let eachLayer = mapLayers[i];
            let layer = map.createLayer(eachLayer.name, tileset, 0, 0);
            layer.setScale(this.zoomFactor);
            this.current_bg[i]=layer;
            if (eachLayer.name == "Wall") {
                let collidableTiles = [];
                let allProperties = map.tilesets[0].tileProperties;
                let firstGid = map.tilesets[0].firstgid;
                for (let key in allProperties) {
                    if (allProperties[key].passable === false) {
                    collidableTiles.push(firstGid + Number(key));
                    }
                }
                layer.setCollision(collidableTiles);
                this.physics.add.collider(this.player, layer);
            }
        }

        //import npc
        this.spawnNpc();

        //house collision area (door)
        let spawnPos = this.location.find(location => location.location_id === this.locationId).spawn_position;
        let x1 = spawnPos.x - 16;
        let y1 = spawnPos.y - 16;
        let x2 = spawnPos.x + 16;
        let y2 = spawnPos.y + 16;
        this.door = new Door(this, x1, y1, x2, y2, '#000', "Exit", "", 0);

        //Talk to npc button
        this.talkButton = this.add.text(this.gameWidth/2+50, this.gameHeight/2-50, 'Talk to someone', {
            fontSize: '24px',
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
        this.enterButton = this.add.text(this.gameWidth/2+50, this.gameHeight/2-50, `Exit ${indoorDetail.label}`, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000'
        })
        .setPadding(10)
        .setInteractive() // Make the text clickable
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
        this.physics.add.overlap(this.player, this.npcList, this.showTalk, null, this);
        this.physics.add.overlap(this.player, this.door, this.showEnter, null, this);

        let playerStartPosX = spawnPos.x * this.zoomFactor;
        let playerStartPosY = spawnPos.y * this.zoomFactor;
        this.player.setPosition(playerStartPosX,playerStartPosY);
        this.player.setScale(0.1);

        this.cameras.main.startFollow(this.player);

        // this.playerBounds = this.add.graphics();
        // this.playerBounds.lineStyle(2, 0xff0000, 1);
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

        if (!this.physics.overlap(this.player, this.door)) {
            this.enterButton.setVisible(false);
        }

        // this.playerBounds.clear();
        // this.playerBounds.lineStyle(2, 0xff0000, 1); // Red outline for the bounding box
        // this.playerBounds.strokeRect(
        //     this.player.getBounds().x,
        //     this.player.getBounds().y,
        //     this.player.getBounds().width,
        //     this.player.getBounds().height
        // );
    }

    spawnNpc(){
        for (let npc of Object.values(this.npc)){
            npc.destroy();
        }
        this.npc={};
        this.npcList = [];

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
                this.npc[tag].setFrame(npc.initialFrame);
            }
        }
        this.children.bringToTop(this.player);
        this.children.bringToTop(this.backdrop['obstacle']);
        this.children.bringToTop(this.guideButton);
        this.children.bringToTop(this.inventoryButton);
        this.children.bringToTop(this.menuButton);
    }

    showTalk(player, object) { //update on new npc
        if (!this.collisionHappened) {
            this.touching=object;
            let activeQuest = this.registry.get("activeQuest");
            let activeSubQuest = this.registry.get("activeSubQuest");
            if (this.dialogue[object.tag][activeSubQuest]  && this.quest[activeQuest].subquest[activeSubQuest].location == this.sceneName){
                this.talkButton.setPosition(object.x - this.talkButton.width / 2,object.y - object.displayHeight/2 - this.talkButton.height - 5)
                this.talkButton.setText(`Talk to ${object.name}`);
                this.talkButton.setVisible(true);
            }else{
                this.talkButton.setVisible(false);
            }
        }
    }

    showEnter(player, object) {
        if (!this.collisionHappened) {
            this.touching['door']=object;
            this.children.bringToTop(this.enterButton);
            this.enterButton.setPosition(object.x - this.enterButton.width / 2, object.y + object.height/2 + this.enterButton.height);
            this.enterButton.setVisible(true);
        }
    }

    talk() { //update on new npc
        this.talkButton.setVisible(false);
        this.collisionHappened = true;
        let object = this.touching;
        console.log(`Talking to the ${object.name}...`);
        let activeSubQuest = this.registry.get("activeSubQuest");
        let chats=this.dialogue[object.tag][activeSubQuest];
        console.log(chats);
        this.dialog1 = new Dialog(this,chats);
        this.dialog1.showDialogs();
    }

    enterDoor() {
        this.enterButton.setVisible(false);
        console.log("Exiting");
        this.exitHouse()
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

    openGuide() {
        if (this.uistatus != 0) {
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
    
        // Add a title
        this.guideTitle = this.add.text(this.gameWidth / 2, this.guideBg.y - this.guideBg.displayHeight * 0.4, 'Game Guide', {
            fontSize: `${this.guideBg.displayWidth * 0.05}px`,
            fontStyle: 'bold',
            fill: '#000000'
        }).setOrigin(0.5);
        this.guideTitle.setScrollFactor(0);
    
        // Add guide content
        this.guideContent = this.add.text(this.gameWidth / 2, this.guideBg.y, 
            'Welcome to the game! Here are some tips:\n\n' +
            '- Use W/A/S/D or Arrow keys to move.\n' +
            '- Click on NPCs to interact with them.\n' +
            '- Open your inventory to manage items.\n' +
            '- Complete quests to progress in the game.\n\n' +
            'Good luck and have fun!', 
            {
                fontSize: `${this.guideBg.displayWidth * 0.03}px`,
                fill: '#000000',
                align: 'center',
                wordWrap: { width: this.guideBg.displayWidth * 0.8 }
            }).setOrigin(0.5);
        this.guideContent.setScrollFactor(0);
    
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

    openInventory(){
        if (this.uistatus!=0){
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
        this.inventoryTitle = this.add.text(this.gameWidth / 2, (this.inventoryBg.y - this.inventoryBg.displayHeight * 0.0875), 'Inventory', {
            fontSize: `${this.inventoryBg.displayWidth*0.03}px`,
            fontStyle: 'bold',
            fill: '#000000'
        }).setOrigin(0.5);
        this.inventoryTitle.setScrollFactor(0);

        // Display inventory items
        this.inventoryItems = [];

        // Add category slots on the left
        let categoryLength = this.inventoryBg.displayWidth*0.05;
        let categoryGap = this.inventoryBg.displayHeight * 0.02;
        let categoryStartX = this.gameWidth*0.3;
        let categoryStartY = this.inventoryTitle.y*1.35;

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
    }

    showCatItem(catType=0){
        let catItemType = [];
        if (catType==0){
            catItemType = ['quest'];
        }else{
            catItemType = ['badge'];
        }

        let playerInventory = this.inventory.filter(item => item.player_id === this.player_id);

        let filteredInventory = playerInventory.filter(inventoryItem => {
            let itemDetails = this.item.find(item => item.item_id === inventoryItem.item_id); // Access item details from this.item
            return itemDetails && catItemType.includes(itemDetails.type); // Check if the type matches
        });

        let startX = this.gameWidth*0.4;
        let startY = this.inventoryTitle.y*1.2;
        // let itemsPerRow = Math.floor((this.gameWidth - 200) / itemWidth);
        let itemsPerRow = 5;
        let totalSlots = 15; // Fixed number of slots
        let itemLength = this.inventoryBg.displayWidth*0.045;
        let itemGapX = this.inventoryBg.displayWidth*0.02;
        let itemGapY = this.inventoryBg.displayHeight*0.008;

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

    openMenu() {
        if (this.uistatus!=0){
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
        this.scene.stop('MainScene');
        this.scene.stop('IndoorScene');
        window.location.href = '/'; // Redirect to the main menu or home page
    }

    exitHouse() {
        console.log("Exiting house...");
        this.scene.switch("MainScene");
        this.scene.stop("IndoorScene");
    }
}
