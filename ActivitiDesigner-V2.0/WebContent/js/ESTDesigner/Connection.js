ESTDesigner.connection.Connection=draw2d.Connection.extend({
	init:function(attr){
		this.name=null;
		this._super($.extend({
			id:draw2d.util.UUID.create(),
	        router:new draw2d.layout.connection.InteractiveManhattanConnectionRouter(),
	        outlineStroke:1,
	        outlineColor:"#303030",
	        stroke:2,
	        color:"#00a8f0",
	        radius:20,
	        targetDecorator:new draw2d.decoration.connection.ArrowDecorator()
	    },attr));
		var connectionNameLabel = new draw2d.shape.basic.Label();
		connectionNameLabel.setText("Connection Name");
		connectionNameLabel.setStroke(0);
		var editor = new draw2d.ui.LabelInplaceEditor({
			// called after the value has been set to the LabelFigure
			onCommit : $.proxy(function(value) {
				this.name=value;
			}, this)
		});
		connectionNameLabel.installEditor(editor);
		this.add(connectionNameLabel,new draw2d.layout.locator.ParallelMidpointLocator());
	},
	onContextMenu : function(x, y) {
		$.contextMenu({
			selector : 'body',
			events : {
				hide : function() {
					$.contextMenu('destroy');
				}
			},
			callback : $.proxy(function(key, options) {
				switch (key) {
				case "Properties":
					
					break;
				case "Delete":
					// without undo/redo support
					// this.getCanvas().remove(this);

					// with undo/redo support
					var cmd = new draw2d.command.CommandDelete(this);
					this.getCanvas().getCommandStack().execute(cmd);
				default:
					break;
				}

			}, this),
			x : x,
			y : y,
			items : {
				"Properties" : {
					name : "Properties"
				},
				"sep1" : "---------",
				"Delete" : {
					name : "Delete"
				}
			}
		});
	}
});