
async function appEntry(canvas, localStorage) {
    let driver = new whm.Driver(new whm.Instance(new TestScene()), canvas, localStorage)
    driver.gameWidth = 100; driver.gameHeight = 100;
    driver.start(canvas, localStorage);
}

function TestScene() {
    this.start = function() {
        this.instance.camera.setScale(10);
        console.log("Scene loaded");
        this.instance.addObject(FloorCollider());
        this.instance.addObject(TestWall());
    };
    this.onRender = function() {
        this.instance.render.fillCanvas(whm.Color.fromHexString("#191970"));
    
        //Draw grid
        // for(var i = 10; i < 200; i += 10){
        //     var color = whm.Color.WHITE;
        //     if (i == 50) color = whm.Color.RED;
        //     this.instance.render._renderLine(i, 0, i, 200, 1, 1, color);
        //     this.instance.render._renderLine(0, i, 200, i, 1, 1, color);
        // }
    };
}
TestScene.prototype = new whm.Scene;

function TestWall() {
    let ch = new whm.GameObject();
    let s = new whm.Script();
    s.onMouseDown = function(e) {
        whm.Debug.log("Click! " + e.x + " " + e.y);
        // this.gameObject.transform.position = new whm.Vector2(e.x/10, e.y/10);
        // this.gameObject.rigidbody.velocity = new whm.Vector2();
        // this.gameObject.rigidbody._b2Body.setAwake(true);
        if(e.button == 1){
            this.gameObject.instance.addObject(getBlock(e.x, e.y));
        }else{
            this.gameObject.instance.addObject(getCircle(e.x, e.y));
        }
    }
    s.onMouseScroll = function(e) {
        whm.Debug.log("SCROLL");
        this.gameObject.instance.camera.setScale(
            this.gameObject.instance.camera.scale + -0.10 * e);
    };
    s.update = function() {
        // TODO DESTROY AFTER 10 seconds
    }
    s.start = function(){
        whm.Debug.log("Controller object loaded");
    }
    ch.addComponent(s);

    return ch;
}

function FloorCollider() {
    let o = new whm.GameObject();
    o.transform.position = new whm.Vector2(0, 5.5);
    let r = new whm.Rigidbody();
    r.bodyType = whm.RigidbodyType.STATIC;
    o.addComponent(r);
    o.addComponent(new whm.BoxCollider(20, 1));
    o.renderer = new whm.RectangleRenderer(20, 1, whm.Color.MAGENTA);
    return o;
}

function getBlock(x, y){
    let bx = Math.random() + 0.2;
    let by = Math.random() + 0.2;
    let colorInt = Math.floor(Math.random() * 4);
    let color = whm.Color.ORANGE;
    if(colorInt == 1) color = whm.Color.RED;
    else if(colorInt == 2) color = whm.Color.BLUE;
    else if(colorInt == 3) color = whm.Color.GREEN;
    let g = new whm.GameObject();
    g.transform.rotation.radians = Math.random() * Math.PI * 2;
    g.transform.position = new whm.Vector2(x, y);
    g.addComponent(new whm.Rigidbody());
    let c = new whm.BoxCollider(bx, by);
    c.friction = 0.3;
    c.bounce = 0.3;
    g.addComponent(c);
    g.renderer = new whm.RectangleRenderer(bx, by, color);
    let s = new whm.Script();
    g.metadata.timer = 0;
    s.update = function() {
        this.gameObject.metadata.timer += whm.Time.deltaTime;
        if(this.gameObject.metadata.timer > 10) this.gameObject.instance.destroyObject(this.gameObject);
    }
    g.addComponent(s);
    return g;
}

function getCircle(x, y){
    let bx = (Math.random() + 0.2)/2;
    let colorInt = Math.floor(Math.random() * 4);
    let color = whm.Color.ORANGE;
    if(colorInt == 1) color = whm.Color.RED;
    else if(colorInt == 2) color = whm.Color.BLUE;
    else if(colorInt == 3) color = whm.Color.GREEN;
    let g = new whm.GameObject();
    g.transform.rotation.radians = Math.random() * Math.PI * 2;
    g.transform.position = new whm.Vector2(x, y);
    g.addComponent(new whm.Rigidbody());
    let c = new whm.CircleCollider(bx);
    c.friction = 0.3;
    c.bounce = 0.3;
    g.addComponent(c);
    g.renderer = new whm.CircleRenderer(bx, color);
    let s = new whm.Script();
    g.metadata.timer = 0;
    s.update = function() {
        this.gameObject.metadata.timer += whm.Time.deltaTime;
        if(this.gameObject.metadata.timer > 10) this.gameObject.instance.destroyObject(this.gameObject);
    }
    g.addComponent(s);
    return g;
}