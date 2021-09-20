
async function appEntry(canvas, localStorage) {
    let driver = new whm.Driver(new whm.Instance(new TestScene()), canvas, localStorage)
    driver.gameWidth = 100; driver.gameHeight = 100;
    driver.start(canvas, localStorage);
}

var playing = false;
var scrolling = true;
var scoreLabel;
var scoreLabelBlack;
var tipLabel;
var tipLabelBlack;
var score = 0;

function TestScene() {
    this.start = function() {
        this.instance.camera.setScale(10);
        this.instance.addObject(Controller());
        this.instance.addObject(FloorCollider(4));
        this.instance.addObject(FloorCollider(-7));
        this.instance.addObject(Background());
        this.instance.addObject(Floor());
        scoreLabelBlack = new whm.Label("Flap", 51, 21, "Impact", whm.Color.BLACK, 20, "center", "middle");
        scoreLabel = new whm.Label("Flap", 50, 20, "Impact", whm.Color.WHITE, 20, "center", "middle");
        tipLabelBlack = new whm.Label("click to start", 50.5, 35.5, "Impact", whm.Color.BLACK, 7, "center", "middle");
        tipLabel = new whm.Label("click to start", 50, 35, "Impact", whm.Color.WHITE, 7, "center", "middle");
        this.instance.addUiItem(scoreLabelBlack);
        this.instance.addUiItem(scoreLabel);
        this.instance.addUiItem(tipLabelBlack);
        this.instance.addUiItem(tipLabel);
        //startGame(this.instance);
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

function startGame(instance){
    instance.addObject(Player());
    instance.addObject(Pipe(5));
    instance.addObject(Pipe(12.5));
    updateLabel();
    updateTipLabel("");
    playing = true;
}

function resetGame(instance){
    score = 0;
    scrolling = true;
    instance.destroyObjectByName("player");
    instance.destroyObjectByName("pipe");
}

function Controller() {
    let o = new whm.GameObject("controller");
    let s = new whm.Script();
    s.onMouseDown = function(e){
        if(e.button == 1){
            if(!playing){
                resetGame(this.gameObject.instance);
                startGame(this.gameObject.instance);
            }
        }
    }
    s.update = function(){
        //console.log(this.gameObject.instance._b2World.getBodyCount());
    }
    o.addComponent(s);
    return o;
}

function Player() {
    let ch = new whm.GameObject("player");
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
        if(playing && e.button == 1){
            this.gameObject.rigidbody.velocity = new whm.Vector2(0,0);
            this.gameObject.transform.rotation.radians = -0.6108;
            this.gameObject.rigidbody._b2Body.applyForceToCenter(new whm.Vector2(0, -320), true);
        }
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
    s.onCollisionEnter = function(g){
        playing = false;
        scrolling = false;
        updateTipLabel("click to restart");
    }
    s.onDestroy = function(){
        console.log("boom!");
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
        if(scrolling){
            this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
            if(this.gameObject.transform.position.x < 0 && !madeNew){
                madeNew = true;
                this.gameObject.instance.addObject(Background(this.gameObject.transform.position.x+17.98));
            }
            if(this.gameObject.transform.position.x < -14){
                this.gameObject.instance.destroyObject(this.gameObject);
            }
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
        if(scrolling){
            this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
            if(this.gameObject.transform.position.x < 0 && !madeNew){
                madeNew = true;
                this.gameObject.instance.addObject(Floor(this.gameObject.transform.position.x+15));
            }
            if(this.gameObject.transform.position.x < -14){
                this.gameObject.instance.destroyObject(this.gameObject);
            }
        }
    }
    o.addComponent(s);
    return o;
}

function FloorCollider(y) {
    let o = new whm.GameObject("floor");
    o.transform.position = new whm.Vector2(0, y);
    let r = new whm.Rigidbody();
    r.bodyType = whm.RigidbodyType.STATIC;
    o.addComponent(r);
    o.addComponent(new whm.BoxCollider(10, 1));
    return o;
}

function Pipe(x){
    let xpos = x || 0;
    let o = new whm.GameObject("pipe");
    let y = Math.floor(Math.random() * 3) + 1.5;
    o.transform.position = new whm.Vector2(xpos, y);
    o.scale = 1/9;
    o.renderer = new whm.ImageRenderer("pipe");
    o.renderer.anchorXPercent = 0;
    o.addComponent(new whm.Rigidbody());
    o.rigidbody.gravityScale = 0;
    let c = new whm.BoxCollider(1.7, 4.6);
    // c.isTrigger = true;
    o.addComponent(c);
    let speed = 4;
    let s = new whm.Script();
    let madeNew = false;
    let addedScore = false;
    s.update = function(){
        if(playing){
            this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
            if(this.gameObject.transform.position.x < 0 && !madeNew){
                madeNew = true;
                this.gameObject.instance.addObject(Pipe(this.gameObject.transform.position.x+15));
            }
            if(this.gameObject.transform.position.x < -4 && !addedScore){
                addedScore = true;
                score += 1;
                updateLabel();
            }
            if(this.gameObject.transform.position.x < -14){
                this.gameObject.instance.destroyObject(this.gameObject);
            }
        }
    }
    s.start = function(){
        this.gameObject.instance.addObject(UpperPipe(this.gameObject.transform.position.x, y));
    }
    o.addComponent(s);
    return o;
}

function updateLabel(){
    scoreLabel.renderer.text = score;
    scoreLabelBlack.renderer.text = score;
}

function updateTipLabel(t){
    tipLabel.renderer.text = t;
    tipLabelBlack.renderer.text = t;
}

function UpperPipe(x, y){
    let xpos = x || 0;
    let o = new whm.GameObject("pipe");
    o.transform.position = new whm.Vector2(xpos, y-8);
    o.scale = 1/9;
    o.renderer = new whm.ImageRenderer("pipe");
    o.renderer.anchorXPercent = 0;
    o.renderer.flipY = true;
    o.addComponent(new whm.Rigidbody());
    o.rigidbody.gravityScale = 0;
    let c = new whm.BoxCollider(1.7, 4.6);
    // c.isTrigger = true;
    o.addComponent(c);
    let speed = 4;
    let s = new whm.Script();
    s.update = function(){
        if(playing){
            this.gameObject.transform.position.x -= speed * this.gameObject.instance.deltaTime;
            if(this.gameObject.transform.position.x < -14){
                this.gameObject.instance.destroyObject(this.gameObject);
            }
        }
    }
    o.addComponent(s);
    return o;
}