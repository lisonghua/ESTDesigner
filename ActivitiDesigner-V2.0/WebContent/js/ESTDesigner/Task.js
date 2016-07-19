/*
 * 所有task节点的基类
 */
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
	getExtensionElementsXML:function(){
		if(this.listeners.getSize()==0)return '';
		var xml = '<extensionElements>\n';
		xml=xml+this.getListenersXML();
		xml=xml+'</extensionElements>\n';
		return xml;
	},
	getListenersXML:function(){
		var xml = '';
		for(var i=0;i<this.listeners.getSize();i++){
			var listener = this.listeners.get(i);
			xml=xml+listener.toXML();
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
/*
 * User Task类型的结点对应的类
 */
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
/*
 * service task类型结点对应的类
 */
ESTDesigner.task.ServiceTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Service Task",
			iconPath : "js/ESTDesigner/icons/type.service.png"
		}, attr), setter, getter);
		this._type=null;
		this._javaClass=null;
		this._expression=null;
		this.delegateExpression=null;
		this.resultVariable=null;
		this.fields=new draw2d.util.ArrayList();
	},
	getStartElementXML:function(){
		var xml='<serviceTask ';
		xml=xml+this.getGeneralXML();
		xml=xml+this.getServiceXML();
		xml=xml+'>\n';
		return xml;
	},
	getServiceXML:function(){
		var xml='';
		if(this._type=='javaClass'){
			if(this._javaClass!=null&&this._javaClass!='')
				xml=xml+' activiti:class="'+this._javaClass+'" '
		}else if(this._type=='expression'){
			if(this._expression!=null&&this._expression!='')
				xml=xml+' activiti:expression="'+this._expression+'" '
		}else if(this._type=='delegateExpression'){
			if(this.delegateExpression!=null&&this.delegateExpression!='')
				xml=xml+' activiti:delegateExpression="'+this.delegateExpression+'" '
		}
		if(this.resultVariable!=null&&this.resultVariable!=''){
			xml=xml+'activiti:resultVariableName="'+this.resultVariable+'" '
		}
		return xml;
	},
	getDocumentationXML:function(){
		if(this.documentation==null||this.documentation=='')return '';
		var xml='<documentation>';
		xml=xml+this.documentation;
		xml=xml+'</documentation>';
		return xml;
	},
	getExtensionElementsXML:function(){
		if(this.listeners.getSize()==0&&this.fields.getSize()==0)return '';
		var xml = '<extensionElements>\n';
		xml=xml+this.getListenersXML();
		xml=xml+this.getFieldsXML();
		xml=xml+'</extensionElements>\n';
		return xml;
	},
	getFieldsXML:function(){
		var xml = "";
		for(var i=0;i<this.fields.getSize();i++){
			var field = this.fields.get(i);
			xml=xml+field.toXML();
		}
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</serviceTask>\n';
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getDocumentationXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});
/*
 * script task类型结点对应的类
 */
ESTDesigner.task.ScriptTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Script Task",
			iconPath : "js/ESTDesigner/icons/type.script.png"
		}, attr), setter, getter);
		this.scriptLanguage=null;
		this.script=null;
	},
	getStartElementXML:function(){
		var xml='<scriptTask ';
		xml=xml+this.getGeneralXML();
		xml=xml+this.getScriptLanguageXML();
		xml=xml+'>\n';
		return xml;
	},
	getScriptLanguageXML:function(){
		var xml=''
		if(this.scriptLanguage!=null&&this.scriptLanguage!='')
			xml=xml+' scriptFormat="'+this.scriptLanguage+'" activiti:autoStoreVariables="true" '
		return xml;
	},
	getScriptXML:function(){
		var xml=''
		if(this.script!=null&&this.script!='')
			xml=xml+'<script>'+this.script+'</script>\n'
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</scriptTask>\n';
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getScriptXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});
/*
 * receive task类型结点对应的类
 */
ESTDesigner.task.ReceiveTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Receive Task",
			iconPath : "js/ESTDesigner/icons/type.receive.png"
		}, attr), setter, getter);
	},
	getStartElementXML:function(){
		var xml='<receiveTask ';
		xml=xml+this.getGeneralXML();
		xml=xml+'>\n';
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</receiveTask>\n';
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});
/*
 * manual task类型结点对应的类
 */
ESTDesigner.task.ManualTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Manual Task",
			iconPath : "js/ESTDesigner/icons/type.manual.png"
		}, attr), setter, getter);
	},
	getStartElementXML:function(){
		var xml='<task ';
		xml=xml+this.getGeneralXML();
		xml=xml+'>\n';
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</task>\n';
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});
/*
 * mail task类型结点对应的类
 */
ESTDesigner.task.MailTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Mail Task",
			iconPath : "js/ESTDesigner/icons/type.send.png"
		}, attr), setter, getter);
		this.to=null;
		this.from=null;
		this.subject=null;
		this.cc=null;
		this.bcc=null;
		this._charset=null;
		this._text=null;
		this._html=null;
	},
	getStartElementXML:function(){
		var xml='<serviceTask ';
		xml=xml+this.getGeneralXML();
		xml=xml+' activiti:type="mail">\n';
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</serviceTask>\n';
		return xml;
	},
	getExtensionElementsXML:function(){
		if(this.listeners.getSize()==0
		&&(this.to==null||this.to=='')
		&&(this.from==null||this.from=='')
		&&(this.subject==null||this.subject=='')
		&&(this.cc==null||this.cc=='')
		&&(this.bcc==null||this.bcc=='')
		&&(this._charset==null||this._charset=='')
		&&(this._text==null||this._text=='')
		&&(this._html==null||this._html==''))
			return '';
		var xml = '<extensionElements>\n';
		xml=xml+this.getListenersXML();
		xml=xml+this.getFieldsXML();
		xml=xml+'</extensionElements>\n';
		return xml;
	},
	getFieldsXML:function(){
		var xml = "";
		if(this.to!=null&&this.to!=''){
			xml=xml+'<activiti:field name="to">\n';
			xml=xml+'<activiti:string>'+this.to+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this.from!=null&&this.from!=''){
			xml=xml+'<activiti:field name="from">\n';
			xml=xml+'<activiti:string>'+this.from+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this.subject!=null&&this.subject!=''){
			xml=xml+'<activiti:field name="subject">\n';
			xml=xml+'<activiti:string>'+this.subject+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this.cc!=null&&this.cc!=''){
			xml=xml+'<activiti:field name="cc">\n';
			xml=xml+'<activiti:string>'+this.cc+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this.bcc!=null&&this.bcc!=''){
			xml=xml+'<activiti:field name="bcc">\n';
			xml=xml+'<activiti:string>'+this.bcc+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this._charset!=null&&this._charset!=''){
			xml=xml+'<activiti:field name="charset">\n';
			xml=xml+'<activiti:string>'+this.to+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this._html!=null&&this._html!=''){
			xml=xml+'<activiti:field name="html">\n';
			xml=xml+'<activiti:string>'+this._html+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		if(this._text!=null&&this._text!=''){
			xml=xml+'<activiti:field name="text">\n';
			xml=xml+'<activiti:string>'+this._text+'</activiti:string>\n';
			xml=xml+'</activiti:field>\n'
		}
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});
/*
 * call activity类型结点对应的类
 */
ESTDesigner.task.CallActivityTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			width:150,
			type : "Call Activity Task",
			iconPath : "js/ESTDesigner/icons/callactivity.png"
		}, attr), setter, getter);
		this.setDimension(160, 60);
		this.callElement=null;
		this.inputParams=new draw2d.util.ArrayList();
		this.outputParams=new draw2d.util.ArrayList();
	},
	getStartElementXML:function(){
		var xml='<callActivity ';
		xml=xml+this.getGeneralXML();
		if(this.callElement!=null&&this.callElement!='')
			xml=xml+' calledElement="'+this.callElement+'"';
		xml=xml+'>\n';
		return xml;
	},
	getExtensionElementsXML:function(){
		if(this.listeners.getSize()==0&&this.inputParams.getSize()==0&&this.outputParams.getSize()==0)
			return '';
		var xml = '<extensionElements>\n';
		xml=xml+this.getListenersXML();
		xml=xml+this.getInputParamsXML();
		xml=xml+this.getOutputParamsXML();
		xml=xml+'</extensionElements>\n';
		return xml;
	},
	getInputParamsXML:function(){
		var xml='';
		for(var i=0;i<this.inputParams.getSize();i++){
			var param = this.inputParams.get(i);
			xml=xml+param.toXML();
		}
		return xml;
	},
	getOutputParamsXML:function(){
		var xml='';
		for(var i=0;i<this.outputParams.getSize();i++){
			var param = this.outputParams.get(i);
			xml=xml+param.toXML();
		}
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</callActivity>\n';
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
	},
	getInputParam:function(id){
		for(var i=0;i<this.inputParams.getSize();i++){
			var param = this.inputParams.get(i);
			if(param.id== id){
				return param;
			}
		}
	},
	deleteInputParam:function(id){
		var param=this.getInputParam(id);
		this.inputParams.remove(param);
	},
	getOutputParam:function(id){
		for(var i=0;i<this.outputParams.getSize();i++){
			var param = this.outputParams.get(i);
			if(param.id== id){
				return param;
			}
		}
	},
	deleteOutputParam:function(id){
		var param=this.getOutputParam(id);
		this.outputParams.remove(param);
	}

});
ESTDesigner.task.CallActivityTask.Parameter=ESTDesigner.task.CallActivityTask.extend({
	init : function(attr) {
		this._super(attr);
		this.source=null;
		this.sourceExpression=null;
		this.target=null;
	},
	getStartElementName:function(){
	},
	getEndElementXML:function(){
		var xml='</'+this.getStartElementName()+'>\n'
		return xml;
	},
	getStartElementXML:function(){
		var xml='<'+this.getStartElementName();
		if(this.source!=null&&this.source!='')
			xml=xml+' source="'+this.source+'"';
		if(this.source!=null&&this.source!='')
			xml=xml+' sourceExpression="'+this.sourceExpression+'"';
		xml=xml+' target="'+this.target+'"';
		xml=xml+'>'
		return xml;
	},
	toXML:function(){
		var xml=''
		xml=xml+this.getStartElementXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});
ESTDesigner.task.CallActivityTask.Parameter.InputParameter=ESTDesigner.task.CallActivityTask.Parameter.extend({
	init:function(attr){
		this._super(attr);
	},
	getStartElementName:function(){
		return 'activiti:in';
	}
});
ESTDesigner.task.CallActivityTask.Parameter.OutputParameter=ESTDesigner.task.CallActivityTask.Parameter.extend({
	init:function(attr){
		this._super(attr);
	},
	getStartElementName:function(){
		return 'activiti:out';
	}
});
/*
 * business rule task类型结点对应的类
 */
ESTDesigner.task.BusinessRuleTask = ESTDesigner.task.BaseTask.extend({
	init : function(attr, setter, getter) {
		this._super($.extend({
			type : "Business Rule Task",
			iconPath : "js/ESTDesigner/icons/type.business.rule.png"
		}, attr), setter, getter);
		this.setDimension(170, 60);
		this.ruleName=null;
		this.inputVariable=null;
		this.excluded=null;
		this.resultVariable=null;
	},
	getStartElementXML:function(){
		var xml='<businessRuleTask ';
		xml=xml+this.getGeneralXML();
		xml=xml+this.getMainConfigXML();
		xml=xml+'>\n';
		return xml;
	},
	getMainConfigXML:function(){
		var xml='';
		if(this.inputVariable!=null&&this.inputVariable!='')
			xml=xml+' activiti:ruleVariablesInput="'+this.inputVariable+'"'; 
		if(this.ruleName!=null&&this.ruleName!='')
			xml=xml+' activiti:rules="'+this.ruleName+'"';
		if(this.resultVariable!=null&&this.resultVariable!='') 
			xml=xml+' activiti:resultVariable="'+this.resultVariable+'"'; 
		if(this.excluded!=null&&this.excluded!='')
			xml=xml+' activiti:exclude="'+this.excluded+'"';
		return xml;
	},
	getEndElementXML:function(){
		var xml = '</businessRuleTask>\n';
		return xml;
	},
	toXML:function(){
		var xml=this.getStartElementXML();
		xml=xml+this.getExtensionElementsXML();
		xml=xml+this.getMultiInstanceXML();
		xml=xml+this.getEndElementXML();
		return xml;
	}
});