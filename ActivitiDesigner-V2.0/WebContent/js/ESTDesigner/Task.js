ESTDesigner.task.BaseTask = draw2d.shape.basic.Rectangle.extend({
	init : function(attr, setter, getter) {
		// additional attribute
		this.name = null;
		this.iconPath = null;// icon path
		this.listeners = new draw2d.util.ArrayList();
		this.type = null;
		this._super($.extend({
			id : draw2d.util.UUID.create()
		}, attr), $.extend({
			type : this.setType,
			iconPath : this.setIconPath
		}, setter), $.extend({
			type : this.getType,
			iconPath : this.getIconPath
		}, getter));
		this.setBackgroundColor("#93d7f3");
		this.setColor("#39b2e5");
		this.setStroke(1);
		this.setRadius(2);
		this.setDimension(130, 60);
		this.setResizeable(false);
		this.createPort("hybrid", new draw2d.layout.locator.LeftLocator());
		this.createPort("hybrid", new draw2d.layout.locator.RightLocator());
		this.createPort("hybrid", new draw2d.layout.locator.BottomLocator());
		this.createPort("hybrid", new draw2d.layout.locator.TopLocator());

		// task's icon
		var ico = new draw2d.shape.basic.Image();
		ico.setDimension(20, 20);
		ico.path = this.iconPath == null ? "" : this.getIconPath();

		// task type label
		var taskTypeLabel = new draw2d.shape.basic.Label({
			bold : true,
			fontSize : 13
		});
		taskTypeLabel.setResizeable(true);
		taskTypeLabel.setText(this.type);
		taskTypeLabel.stroke = 0;
		taskTypeLabel.on("contextmenu", function(emitter, event) {
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
						var cmd = new draw2d.command.CommandDelete(this
								.getParent());
						this.getCanvas().getCommandStack().execute(cmd);
					default:
						break;
					}

				}, this),
				x : event.x,
				y : event.y,
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
		});
		ico.add(taskTypeLabel, new draw2d.layout.locator.RightLocator());
		// task name label
		var taskNameLabel = new draw2d.shape.basic.Label();
		taskNameLabel.setText("Task Name");
		taskNameLabel.setStroke(0);
		var editor = new draw2d.ui.LabelInplaceEditor({
			// called after the value has been set to the LabelFigure
			onCommit : $.proxy(function(value) {
				taskNameLabel.getParent().name=value;
			}, this)
		});
		taskNameLabel.installEditor(editor);

		this.add(ico, new draw2d.layout.locator.XYRelPortLocator(5, 33));
		this.add(taskNameLabel, new draw2d.layout.locator.BottomLocator());
	},
	getType : function() {
		return this.iconPath;
	},
	setType : function(type) {
		this.type = type;
		this.fireEvent("change:type", {
			value : this.type
		});
		return this;
	},
	getIconPath : function() {
		return this.iconPath;
	},
	setIconPath : function(path) {
		this.iconPath = path;
		this.fireEvent("change:iconPath", {
			value : this.iconPath
		});
		return this;
	},
	toXML : function() {
		return "";
	},
	getListener : function(id) {
		for (var i = 0; i < this.listeners.getSize(); i++) {
			var listener = this.listeners.get(i);
			if (listener.getId() === id) {
				return listener;
			}
		}
	},
	deleteListener : function(id) {
		var listener = this.getListener(id);
		this.listeners.remove(listener);
	},
	addListener : function(listener) {
		this.listeners.add(listener);
	},
	setListeners : function(listeners) {
		this.listeners = listeners;
	},
	toBpmnDI : function() {
		var w = this.getWidth();
		var h = this.getHeight();
		var x = this.getX();
		var y = this.getY();
		var xml = '<bpmndi:BPMNShape bpmnElement="' + this.getId()
				+ '" id="BPMNShape_' + this.getId() + '">\n';
		xml = xml + '<omgdc:Bounds height="' + h + '" width="' + w + '" x="'
				+ x + '" y="' + y + '"/>\n';
		xml = xml + '</bpmndi:BPMNShape>\n';
		return xml;
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
ESTDesigner.task.UserTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "User Task",
			iconPath : "js/ESTDesigner/icons/type.user.png"
		}, attr), setter, getter);
	}
});
ESTDesigner.task.ServiceTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Service Task",
			iconPath : "js/ESTDesigner/icons/type.service.png"
		}, attr), setter, getter);
	}
});
ESTDesigner.task.ScriptTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Script Task",
			iconPath : "js/ESTDesigner/icons/type.script.png"
		}, attr), setter, getter);
	}
});
ESTDesigner.task.ReceiveTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Receive Task",
			iconPath : "js/ESTDesigner/icons/type.receive.png"
		}, attr), setter, getter);
	}
});
ESTDesigner.task.ManualTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Manual Task",
			iconPath : "js/ESTDesigner/icons/type.manual.png"
		}, attr), setter, getter);
	}
});
ESTDesigner.task.MailTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Mail Task",
			iconPath : "js/ESTDesigner/icons/type.send.png"
		}, attr), setter, getter);
	}
});
ESTDesigner.task.CallActivityTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			width:150,
			type : "Call Activity Task",
			iconPath : "js/ESTDesigner/icons/callactivity.png"
		}, attr), setter, getter);
		this.setDimension(160, 60);
	}
});
ESTDesigner.task.BusinessRuleTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Business Rule Task",
			iconPath : "js/ESTDesigner/icons/type.business.rule.png"
		}, attr), setter, getter);
		this.setDimension(170, 60);
	}
});