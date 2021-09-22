
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
var maxSmacks = 2;
var hsLabel;

// TODO test mouse move and up and down

function TestScene() {
    this.start = function() {
        whm.Physics.ignoreLayerCollision(0, 2, true);
        whm.AudioListener.volume = this.instance.prefs.get("vol") === null ? 0.5 : this.instance.prefs.get("vol");
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
        hsLabel = new whm.Label("", 5, 5, "Impact", whm.Color.WHITE, 6, "left", "middle");
        this.instance.addUiItem(scoreLabelBlack);
        this.instance.addUiItem(scoreLabel);
        this.instance.addUiItem(tipLabelBlack);
        this.instance.addUiItem(tipLabel);
        this.instance.addUiItem(hsLabel);
        this.instance.addUiItem(GetVolumeWidget());
        updateHSLabel(this.instance);
    };
    this.loadAssets = function(){
        let a = this.instance.assets;
        a.loadAudio("smack", "./smack.mp3");
        a.loadAudio("whoosh", "./whoosh.mp3");
        a.loadAudio("fall", "./fall.mp3");
        a.loadAudio("ding", "./ding.mp3");
        a.loadSpriteSheet("flap", "./flap.png", "./flap.txt");
        a.loadImage("bg", "./flapbg.png");
        a.loadImage("floor", "./flapg.png");
        a.loadImage("pipe", "./pipe.png");
        a.loadImage("volume", "./volume.png");
        a.loadImage("novolume", "./novolume.png");
    }
    this.onRender = function() {
        this.instance.render.fillCanvas(whm.Color.fromHexString("#191970"));
    };
}
TestScene.prototype = new whm.Scene;

function updateHSLabel(instance) {
    if(instance.prefs.get("hs") && instance.prefs.get("hs") > 0){
        hsLabel.renderer.text = "Best: " + instance.prefs.get("hs");
    }
}

function startGame(instance){
    instance.addObject(Player());
    instance.addObject(Pipe(5));
    instance.addObject(Pipe(12.5));
    updateLabel();
    updateTipLabel("");
    updateHSLabel(instance);
    playing = true;
}

function resetGame(instance){
    maxSmacks = 2;
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
    o.addComponent(s);
    return o;
}

function Player() {
    let ch = new whm.GameObject("player");
    ch.layer = 1;
    ch.transform.position = new whm.Vector2(-2.5, 0);
    ch.scale = 1/10;
    let s = new whm.Script();
    ch.renderer = new whm.ImageRenderer("flap");
    ch.renderer.spriteName = "flap1";
    ch.addComponent(new whm.Rigidbody());
    let c = new whm.CircleCollider(0.4);
    c.bounce = 0.35;
    ch.addComponent(c);
    s.onMouseDown = function(e) {
        if(playing && e.button == 1){
            console.log("BOOST");
            this.gameObject.instance.sound.getAudioInstance("whoosh").play();
            this.gameObject.rigidbody.velocity = new whm.Vector2();
            this.gameObject.rigidbody._b2Body.setLinearVelocity(new whm.Vector2());
            this.gameObject.transform.rotation.radians = -0.6108;
            this.gameObject.rigidbody._b2Body.applyForceToCenter(new whm.Vector2(0, -200), true);
        }
    }
    s.update = function(e){
        console.log(this.gameObject.rigidbody.velocity.y);
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
        if(playing){
            if(this.gameObject.transform.position.y < -0.5 && playing){
                this.gameObject.instance.sound.getAudioInstance("fall").play();
            }
            playing = false;
            let newhs = UpdateHighScore(this.gameObject.instance, score);
            if(maxSmacks > 0){
                maxSmacks -= 1;
                this.gameObject.instance.sound.getAudioInstance("smack").play();
            }
            scrolling = false;
            let text = "click to restart";
            if(newhs) text += "\n\nNEW HIGH SCORE";
            updateTipLabel(text);
        }
    }
    s.onDestroy = function(){
        // console.log("boom!");
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
    o.renderer.sortingOrder = -1;
    o.renderer.anchorXPercent = 0;
    let speed = 1;
    let s = new whm.Script();
    let madeNew = false;
    s.update = function(){
        if(scrolling){
            this.gameObject.transform.position.x -= speed * whm.Time.deltaTime;
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
    o.renderer.sortingOrder = 1;
    o.renderer.anchorXPercent = 0;
    let speed = 4;
    let s = new whm.Script();
    let madeNew = false;
    s.update = function(){
        if(scrolling){
            this.gameObject.transform.position.x -= speed * whm.Time.deltaTime;
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
    o.layer = 2;
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
            this.gameObject.transform.position.x -= speed * whm.Time.deltaTime;
            if(this.gameObject.transform.position.x < 0 && !madeNew){
                madeNew = true;
                this.gameObject.instance.addObject(Pipe(this.gameObject.transform.position.x+15));
            }
            if(this.gameObject.transform.position.x < -4 && !addedScore){
                addedScore = true;
                score += 1;
                this.gameObject.instance.sound.getAudioInstance("ding").play();
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
    o.layer = 2;
    o.transform.position = new whm.Vector2(xpos, y-7.5);
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
            this.gameObject.transform.position.x -= speed * whm.Time.deltaTime;
            if(this.gameObject.transform.position.x < -14){
                this.gameObject.instance.destroyObject(this.gameObject);
            }
        }
    }
    o.addComponent(s);
    return o;
}

function UpdateHighScore(instance, score){
    let hs = instance.prefs.get("hs");
    if(hs){
        instance.prefs.set("hs", Math.max(score,hs));
        return score > hs;
    }else{
        instance.prefs.set("hs", score)
        return true;
    }
}

function GetVolumeWidget(){
    let o = new whm.GameObject();
    o.scale = 0.25;
    o.transform.position = new whm.Vector2(95, 5);
    o.renderer = new whm.ImageRenderer("volume");
    let s = new whm.Script();
    s.update = function(){
        let sprite = whm.AudioListener.volume > 0 ? "volume" : "novolume";
        this.gameObject.renderer.imageName = sprite;
    };
    // TODO this is jank please fix
    s.onMouseDown = function(e){
        if(e.x > 90  && e.y < 10) {
            whm.AudioListener.volume = whm.AudioListener.volume > 0 ? 0 : 0.5;
            this.gameObject.instance.prefs.set("vol", whm.AudioListener.volume);
            return true;
        }
    };
    o.addComponent(s);
    return o;
}


// Button state after death
// Timer before button state
// Fix on enter collision.........
// Title screen with character
// Revamp input system