ESTDesigner.event.BaseEvent=draw2d.shape.basic.Image.extend({
	init:function(attr){
		this._super($.extend({
			id:draw2d.util.UUID.create(),
			width:40,
			height:40,
			resizeable:false
		},attr));
	}
});
ESTDesigner.event.Start=ESTDesigner.event.BaseEvent.extend({
	init:function(attr){
		this._super($.extend({
			path:"js/ESTDesigner/icons/type.startevent.none.png"
				},attr));
		this.createPort("output", new draw2d.layout.locator.LeftLocator());
		this.createPort("output", new draw2d.layout.locator.RightLocator());
		this.createPort("output", new draw2d.layout.locator.BottomLocator());
		this.createPort("output", new draw2d.layout.locator.TopLocator());
	}
});

ESTDesigner.event.End=ESTDesigner.event.BaseEvent.extend({
	init:function(attr){
		this._super($.extend({
			
			path:"js/ESTDesigner/icons/type.endevent.none.png"
				},attr));
		this.createPort("input", new draw2d.layout.locator.LeftLocator());
		this.createPort("input", new draw2d.layout.locator.RightLocator());
		this.createPort("input", new draw2d.layout.locator.BottomLocator());
		this.createPort("input", new draw2d.layout.locator.TopLocator());
	}
});