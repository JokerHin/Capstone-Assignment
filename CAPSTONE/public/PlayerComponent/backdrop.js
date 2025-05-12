export class Backdrop extends Phaser.Physics.Arcade.Sprite {
    constructor(game, x, y, name, scale) {
        super(game, x, y, name);
        game.add.existing(this);
        game.physics.add.existing(this);
        this.scale = scale;
        this.setScale(scale);
        this.game=game;
        this.name=name;
        this.setOrigin(0, 0);
    }
}