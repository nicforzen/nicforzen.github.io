
async function appEntry(canvas, localStorage) {
    let driver = new whm.Driver(new whm.Instance(new TestScene()), canvas, localStorage)
    driver.gameWidth = 100; driver.gameHeight = 100;
    driver.start(canvas, localStorage);
}

function TestScene() {
    this.start = function() {
        this.instance.camera.setScale(10);
        this.instance.addObject(FloorCollider(4));
        this.instance.addObject(FloorCollider(-7));
        this.instance.addObject(Background());
        this.instance.addObject(Player());
        this.instance.addObject(Floor());
        this.instance.addObject(Pipe(5));
        this.instance.addObject(Pipe(12.5));
    };
    this.loadAssets = function(){
        this.instance.assets.loadSpriteSheet("flap", "./flap.png", "./flap.txt");
        this.instance.assets.loadImage("bg", "./flapbg.png");
        this.instance.assets.loadImage("floor", "./flapg.png");
        this.instance.assets.loadImage("pipe", "./pipe.png");
    }
    this.onRender = function() {
        this.instance.render.fillCanvas(whm.Color.fromHexString("#191970"));
    };
}
TestScene.prototype = new whm.Scene;

function Player() {
    let ch = new whm.GameObject();
    ch.transform.position = new whm.Vector2(-2.5, 0);
    ch.scale = 1/10;
    let s = new whm.Script();
    ch.renderer = new whm.ImageRenderer("flap");
    ch.renderer.spriteName = "flap1";
    ch.addComponent(new whm.Rigidbody());
    let c = new whm.CircleCollider(0.5);
    c.bounce = 0.35;
    ch.addComponent(c);
    s.onMouseDown = function(e) {
        this.gameObject.rigidbody.velocity = new whm.Vector2(0,0);
        this.gameObject.transform.rotation.radians = -0.6108;
        this.gameObject.rigidbody._b2Body.applyForceToCenter(new whm.Vector2(0, -320), true);
    }
    s.update = function(e){
        if(this.gameObject.rigidbody.velocity.y < -1){
            ch.renderer.spriteName = "flap2";
        }else if(this.gameObject.rigidbody.velocity.y > 1){
            ch.renderer.spriteName = "flap0";
        }else{
            ch.renderer.spriteName = "flap1";
        }

        let range = 2;
        let clampSpeed = whm.Util.clamp(this.gameObject.rigidbody.velocity.y, -range, range);
        clampSpeed = 2 * ( (clampSpeed - -range) / (range - -range) ) - 1
        this.gameObject.transform.rotation.radians = 0.6108 * clampSpeed;
    }
    ch.addComponent(s);

    return ch;
}

function Background(x) {
    let xpos = x || 0;
    let o = new whm.GameObject();
    o.transform.position = new whm.Vector2(xpos, -1);
    o.scale = 1/50;
    o.renderer = new whm.ImageRenderer("bg");
    o.renderer.zorder = -1;
    o.renderer.anchorXPercent = 0;
    let speed = 1;
    let s = new whm.Script();
    let madeNew = false;
    s.update = function(){
        this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
        if(this.gameObject.transform.position.x < 0 && !madeNew){
            madeNew = true;
            this.gameObject.instance.addObject(Background(this.gameObject.transform.position.x+17.98));
        }
        if(this.gameObject.transform.position.x < -14){
            this.gameObject.instance.destroyObject(this.gameObject);
        }
    }
    o.addComponent(s);
    return o;
}

function Floor(x) {
    let xpos = x || 0;
    let o = new whm.GameObject();
    o.transform.position = new whm.Vector2(xpos, 6);
    o.scale = 1/20;
    o.renderer = new whm.ImageRenderer("floor");
    o.renderer.zorder = 1;
    o.renderer.anchorXPercent = 0;
    let speed = 4;
    let s = new whm.Script();
    let madeNew = false;
    s.update = function(){
        this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
        if(this.gameObject.transform.position.x < 0 && !madeNew){
            madeNew = true;
            this.gameObject.instance.addObject(Floor(this.gameObject.transform.position.x+15));
        }
        if(this.gameObject.transform.position.x < -14){
            this.gameObject.instance.destroyObject(this.gameObject);
        }
    }
    o.addComponent(s);
    return o;
}

function FloorCollider(y) {
    let o = new whm.GameObject();
    o.transform.position = new whm.Vector2(0, y);
    let r = new whm.Rigidbody();
    r.bodyType = whm.RigidbodyType.STATIC;
    o.addComponent(r);
    o.addComponent(new whm.BoxCollider(10, 1));
    return o;
}

function Pipe(x){
    let xpos = x || 0;
    let o = new whm.GameObject();
    let y = Math.floor(Math.random() * 3) + 1.5;
    o.transform.position = new whm.Vector2(xpos, y);
    o.scale = 1/9;
    o.renderer = new whm.ImageRenderer("pipe");
    o.renderer.anchorXPercent = 0;
    let speed = 4;
    let s = new whm.Script();
    let madeNew = false;
    s.update = function(){
        this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
        if(this.gameObject.transform.position.x < 0 && !madeNew){
            madeNew = true;
            this.gameObject.instance.addObject(Pipe(this.gameObject.transform.position.x+15));
        }
        if(this.gameObject.transform.position.x < -14){
            this.gameObject.instance.destroyObject(this.gameObject);
        }
    }
    s.start = function(){
        this.gameObject.instance.addObject(UpperPipe(this.gameObject.transform.position.x, y));
    }
    o.addComponent(s);
    return o;
}

function UpperPipe(x, y){
    let xpos = x || 0;
    let o = new whm.GameObject();
    o.transform.position = new whm.Vector2(xpos, y-8);
    o.scale = 1/9;
    o.renderer = new whm.ImageRenderer("pipe");
    o.renderer.anchorXPercent = 0;
    o.renderer.flipY = true;
    let speed = 4;
    let s = new whm.Script();
    s.update = function(){
        this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
        if(this.gameObject.transform.position.x < -14){
            this.gameObject.instance.destroyObject(this.gameObject);
        }
    }
    o.addComponent(s);
    return o;
}