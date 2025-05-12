export class Npc extends Phaser.Physics.Arcade.Sprite {
    constructor(game, x, y, tag, name, scale, position_id=0) {
        super(game, 0, 0, tag);
        game.add.existing(this);
        game.physics.add.existing(this);
        this.scale=game.npcDetail[tag].scale;
        let bgscale=game.current_bg.scale;
        this.setScale(this.scale*2);
        this.game = game;
        this.mapPosx=x;
        this.mapPosy=y;
        this.tag=tag;
        this.name=this.game.npcDetail[tag].name;
        this.position_id=position_id;
        let actualPosx=this.mapPosx*bgscale;
        let actualPosy=this.mapPosy*bgscale;
        this.setPosition(actualPosx,actualPosy);
    }
}