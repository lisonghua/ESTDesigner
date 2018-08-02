ESTDesigner.connection.Connection=draw2d.Connection.extend({
	init:function(attr){
		this.name=null;
		this._super($.extend({
			id:draw2d.util.UUID.create(),
	        router:new draw2d.layout.connection.ManhattanBridgedConnectionRouter(),
	        outlineStroke:1,
	        outlineColor:"#303030",
	        stroke:2,
	        color:"#00a8f0",
	        radius:4,
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
	},
	toXML:function(){
		return "";
	},
	toBpmnDI:function(){
		var xml='<bpmndi:BPMNEdge bpmnElement="'+this.getId()+'" id="BPMNEdge_'+this.getId()+'">\n';
		var startX = this.getSource().getAbsoluteX();
		var startY = this.getSource().getAbsoluteY();
		var endX = this.getTarget().getAbsoluteX();
		var endY = this.getTarget().getAbsoluteY();
		xml=xml+'<omgdi:waypoint x="'+startX+'" y="'+startY+'"/>\n';
	    xml=xml+'<omgdi:waypoint x="'+endX+'" y="'+endY+'"/>\n';
		xml=xml+'</bpmndi:BPMNEdge>\n';
		return xml;
	}
});