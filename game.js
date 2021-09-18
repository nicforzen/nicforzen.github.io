async function appEntry(canvas, localStorage) {
    let driver = new whm.Driver(new whm.Instance(new TestScene()), canvas, localStorage)
    driver.gameWidth = 100; driver.gameHeight = 100;
    driver.start(canvas, localStorage);
}

function TestScene() {
    this.start = function() {
        console.log("Scene loaded");
        this.instance.addObject(TestWall());
    };
    this.onRender = function() {
        this.instance.render.fillCanvas(whm.Color.fromHexString("#191970"));
    
        //Draw grid
        for(var i = 10; i < 200; i += 10){
            var color = whm.Color.WHITE;
            if (i == 50) color = whm.Color.RED;
            this.instance.render._renderLine(i, 0, i, 200, 1, 1, color);
            this.instance.render._renderLine(0, i, 200, i, 1, 1, color);
        }
    };
}
TestScene.prototype = new whm.Scene;

function TestWall() {
    let ch = new whm.GameObject();
    ch.renderer = new whm.RectangleRenderer(20, 20, whm.Color.RED);

    let s = new whm.Script();
    s.onMouseDown = function(e) {
        whm.Debug.log("Click!");
        this.gameObject.transform.position = new whm.Vector2(e.x, e.y);
        this.gameObject.rigidbody.velocity = new whm.Vector2();
        this.gameObject.rigidbody._b2Body.setAwake(true);
    }
    s.onMouseScroll = function() {
        whm.Debug.log("SCROLL");
        // TODO scroll camera
    };
    s.update = function() {
        //console.log(this.gameObject.transform.position.y);
        //console.log(this.gameObject.rigidbody.velocity.y);
    }
    s.start = function(){
        whm.Debug.log("hi");
    }
    ch.addScript(s);

    return ch;
}