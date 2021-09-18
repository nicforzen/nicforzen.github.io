async function appEntry(canvas, localStorage) {
    let driver = new whm.Driver(new whm.Instance(new TestScene()), canvas, localStorage)
    driver.gameWidth = 100; driver.gameHeight = 100;
    driver.start(canvas, localStorage);
}

function TestScene() {
    this.start = function() {
        this.instance.camera.setScale(10);
        console.log("Scene loaded");
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
    ch.renderer = new whm.RectangleRenderer(1, 1, whm.Color.RED);

    let s = new whm.Script();
    s.onMouseDown = function(e) {
        whm.Debug.log("Click! " + e.x + " " + e.y);
        // this.gameObject.transform.position = new whm.Vector2(e.x/10, e.y/10);
        // this.gameObject.rigidbody.velocity = new whm.Vector2();
        // this.gameObject.rigidbody._b2Body.setAwake(true);
        let ch2 = new whm.GameObject();
        let ss = new whm.Script();
        ss.update = function() {
            //console.log(this.gameObject.transform.rotation.radians);
        }
        ch2.addScript(ss);
        ch2.transform.position = new whm.Vector2(e.x/10, e.y/10);
        // ch2.transform.position = new whm.Vector2(e.x, e.y);
        //ch2.transform.rotation.radians = -1.5708;
        ch2.transform.rotation.radians = 1.5708;
        ch2.renderer = new whm.RectangleRenderer(1, 1, whm.Color.RED);
        this.gameObject.instance.addObject(ch2);
    }
    s.onMouseScroll = function() {
        whm.Debug.log("SCROLL");
        // TODO scroll camera
    };
    s.update = function() {
        //console.log(this.gameObject.transform.position.y);
        //console.log(this.gameObject.rigidbody.velocity.y);
        // console.log(this.gameObject.transform.rotation.radians);
    }
    s.start = function(){
        whm.Debug.log("hi");
    }
    ch.addScript(s);

    return ch;
}