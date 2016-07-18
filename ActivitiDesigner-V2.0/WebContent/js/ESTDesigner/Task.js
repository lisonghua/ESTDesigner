ESTDesigner.task.BaseTask = draw2d.shape.basic.Rectangle.extend({
	init : function(attr, setter, getter) {
		// additional attribute
		this.name = null;
		this.iconPath = null;// icon path
		this.listeners = new draw2d.util.ArrayList();
		this.type = null;
		this.documentation=null;
		this.asynchronous=null;
		this.exclusive=true;
		this.isSequential=false;
		this._loopCardinality=null;
		this._collection=null;
		this._elementVariable=null;
		this._completionCondition=null;
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
		ico.add(taskTypeLabel, new draw2d.layout.locator.RightLocator());
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
						//console.log(emitter.getParent());
						emitter.getParent().getParent().propHandler();
						break;
					case "Delete":
						// without undo/redo support
						// this.getCanvas().remove(this);

						// with undo/redo support
						var cmd = new draw2d.command.CommandDelete(emitter.getParent().getParent());
						emitter.getCanvas().getCommandStack().execute(cmd);
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
	propHandler:function(){
		
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
					this.propHandler();
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
	getGeneralXML:function(){
		var name = this.id;
		var taskName = $.trim(this.name);
		if(taskName != null && taskName != "")
			name = taskName;
		var xml=' id="'+this.id+'" name="'+name+'" ';
		if(this.asynchronous){
			xml=xml+'activiti:async="true" '
		}
		if(!this.exclusive){
			xml=xml+'activiti:exclusive="false" '
		}
		return xml;
	},
	getMultiInstanceXML:function(){
		var xml = '';
		if(this.isSequential){
			xml=xml+'<multiInstanceLoopCharacteristics ';
			if(this._elementVariable!=null&&this._elementVariable!='')
				xml=xml+'activiti:elementVariable="'+this._elementVariable+'" ';
			if(this._collection!=null&&this._collection!='')
				xml=xml+'activiti:collection="'+this._collection+'" ';
			xml=xml+'>\n'
			if(this._loopCardinality!=null&&this._loopCardinality!='')
				xml=xml+'<loopCardinality>'+this._loopCardinality+'</loopCardinality>\n';
			if(this._completionCondition!=null&&this._completionCondition!='')
				xml=xml+'<completionCondition>'+this._completionCondition+'</completionCondition>\n'
			xml=xml+'</multiInstanceLoopCharacteristics>\n';
		}
		return xml;
	},
	toXML:function(){
		return "";
	},
	toBpmnDI:function(){
		var w=this.getWidth();
		var h=this.getHeight();
		var x=this.getAbsoluteX();
		var y=this.getAbsoluteY();
		var xml='<bpmndi:BPMNShape bpmnElement="'+this.getId()+'" id="BPMNShape_'+this.getId()+'">\n';
		xml=xml+'<omgdc:Bounds height="'+h+'" width="'+w+'" x="'+x+'" y="'+y+'"/>\n';
		xml=xml+'</bpmndi:BPMNShape>\n';
		return xml;
	}
});
ESTDesigner.task.UserTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "User Task",
			iconPath : "js/ESTDesigner/icons/type.user.png"
		}, attr), setter, getter);
		this.performerType=null;
		this.dueDate=null;
		this.priority=null;
		this.formKey = null;
		this.expression=null;
		this.isUseExpression=null;
		this.assignee=null;
		this.candidateUsers=new draw2d.util.ArrayList();
		this.candidateGroups=new draw2d.util.ArrayList();
		this.formProperties=new draw2d.util.ArrayList();
		this.taskListeners=new draw2d.util.ArrayList();
	},
	getIconClassName:function(){
		return "user-task-icon";
	},
	getStartElementXML:function(){
		var xml='<userTask ';
		xml=xml+this.getGeneralXML();
		xml=xml+this.getPerformersXML();
		xml=xml+'>\n';
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</userTask>\n';
		return xml;
	},
	getDocumentationXML:function(){
		if(this.documentation==null||this.documentation=='')return '';
		var xml='<documentation>';
		xml=xml+this.documentation;
		xml=xml+'</documentation>';
		return xml;
	},
	getPerformersXML:function(){
		var xml='';
		if(this.isUseExpression){
			if(this.expression!=null&&this.expression!=''){
				if(this.performerType=='assignee'){
					xml=xml+'activiti:assignee="'+this.expression+'" ';
				}else if(this.performerType=='candidateUsers'){
					xml=xml+'activiti:candidateUsers="'+this.expression+'" ';
				}else if(this.performerType=='candidateGroups'){
					xml=xml+'activiti:candidateGroups="'+this.expression+'" ';
				}
			}
		}else{
			if(this.performerType=='assignee'){
				if(this.assignee!=null&&this.assignee!='')
					xml=xml+this.assignee;
			}else if(this.performerType=='candidateUsers'){
				for(var i=0;i<this.candidateUsers.getSize();i++){
					var user = this.candidateUsers.get(i);
					xml=xml+user.sso+',';
				}
			}else if(this.performerType=='candidateGroups'){
				for(var i=0;i<this.candidateGroups.getSize();i++){
					var group = this.candidateGroups.get(i);
					xml=xml+group+',';
				}
			}
		}
		if(this.dueDate!=null&&this.dueDate!=''){
			xml=xml+'activiti:dueDate="'+this.dueDate+'" '
		}
		if(this.formKey != null && this.formKey != ""){
			xml=xml+'activiti:formKey="'+this.formKey+'" ';
		}
		if(this.priority!=null&&this.priority!=''){
			xml=xml+'activiti:priority="'+this.priority+'" '
		}
		
		return xml;
	},
	getExtensionElementsXML:function(){
		if(this.listeners.getSize()==0&&this.formProperties.getSize()==0)return '';
		var xml = '<extensionElements>\n';
		xml=xml+this.getFormPropertiesXML();
		xml=xml+this.getListenersXML();
		xml=xml+'</extensionElements>\n';
		return xml;
	},
	getListenersXML:function(){
		var xml = draw2d.Task.prototype.getListenersXML.call(this);
		for(var i=0;i<this.taskListeners.getSize();i++){
			var listener = this.taskListeners.get(i);
			xml=xml+listener.toXML();
		}
		return xml;
	},
	getFormPropertiesXML:function(){
		var xml = '';
		for(var i=0;i<this.formProperties.getSize();i++){
			var formProperty = this.formProperties.get(i);
			xml=xml+formProperty.toXML();
		}
		return xml;
	},
	propHandler:function(){
		
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getDocumentationXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
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