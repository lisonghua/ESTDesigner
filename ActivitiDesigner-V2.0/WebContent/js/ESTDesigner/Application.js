var ESTDesigner={
	event:{},
	task:{},
	gateway:{},
	connection:{},
	container:{},
	model:{}
};
var DefaultModelTypeEnum=[
                          
                          ];

ESTDesigner.model.BaseModel=Class.extend({
	init:function(){
		
	}
});
ESTDesigner.model.Process=ESTDesigner.model.BaseModel.extend({
	init:function(){
		this._super();
		this.id=null;
		this.name=null;
		this.category=null;
		this.documentation=null;
		this.listeners=new draw2d.util.ArrayList();
		this.variables=new draw2d.util.ArrayList();
	},
	getListener:function(id){
		for(var i=0;i<this.listeners.getSize();i++){
			var listener = this.listeners.get(i);
			if(listener.getId()=== id){
				return listener;
			}
		}
	},
	deleteListener:function(id){
		var listener = this.getListener(id);
		this.listeners.remove(listener);
	},
	addListener:function(listener){
		this.listeners.add(listener);
	},
	setListeners:function(listeners){
		this.listeners = listeners;
	},
	getVariable:function(id){
		for(var i=0;i<this.variables.getSize();i++){
			var variable = this.variables.get(i);
			if(variable.id=== id){
				return variable;
			}
		}
	},
	deleteVariable:function(id){
		var variable = this.getVariable(id);
		this.variables.remove(variable);
	},
	addVariable:function(variable){
		this.variables.add(variable);
	},
	getVariablesJSONObject:function(){
		return JSON.stringify(this.variables.data);
	},
	getListenersXML:function(){
		var xml = '';
		for(var i=0;i<this.listeners.getSize();i++){
			var listener = this.listeners.get(i);
			xml=xml+listener.toXML();
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
	getDocumentationXML:function(){
		var documentation = $.trim(this.documentation);
		if(documentation==null||documentation=='')return '';
		var xml='<documentation>';
		xml=xml+this.documentation;
		xml=xml+'</documentation>';
		return xml;
	}
});
ESTDesigner.model.Variable=ESTDesigner.model.BaseModel.extend({
	init:function(){
		this.id=draw2d.util.UUID.create();
		this.name=null;
		this.type=null;
		this.scope=null;
		this.defaultValue=null;
		this.remark=null;
	}
});
//excution listener object
ESTDesigner.model.Listener=ESTDesigner.model.BaseModel.extend({
	init:function(){
		this.id=draw2d.util.UUID.create();
		this.event=null;
		this.serviceType=null;
		this.serviceClass=null;
		this.serviceExpression=null;
		this.fields=new draw2d.util.ArrayList();
	},
	setId:function(id){
		this.id=id;
	},
	getId:function(){
		return this.id;
	},
	setField:function(field){
		this.fields.add(field);
	},
	getField:function(id){
		for(var i=0;i<this.fields.getSize();i++ ){
			var field = this.fields.get(i);
			if(field.id == id){
				return field;
			}
		}
	},
	deleteField:function(id){
		var field = this.getField(id);
		this.fields.remove(field);
	},
	getServiceImplementation:function(){
		if(this.serviceType=='javaClass')
			return this.serviceClass;
		else if(this.serviceType=='expression')
			return this.serviceExpression;
	},
	getFieldsString:function(){
		var f = '';
		var v = '';
		for(var i=0;i<this.fields.getSize();i++){
			var field = this.fields.get(i);
			f=f+field.name+":"+field.value+",";
		}
		return f;
	},
	toJSON:function(){
		var json={
				id:this.id,
				event:this.event,
				serviceType:this.serviceType,
				serviceClass:this.serviceClass,
				serviceExpression:this.serviceExpression,
				fields:this.fields.data
		};
		return JSON.stringify(json);
	},
	parseJSON:function(){
		var jsonString = this.toJSON();
		return JSON.parse(jsonString);
	},
	getFieldsXML:function(){
		var xml = "";
		for(var i=0;i<this.fields.getSize();i++){
			var field = this.fields.get(i);
			xml=xml+field.toXML();
		}
		return xml;
	},
	toXML:function(){
		var xml = '<activiti:executionListener event="'+this.event+'" ';
		if(this.serviceType=='javaClass'){
			xml=xml+'class="'+this.serviceClass+'" ';
		}else if(this.serviceType=='expression'){
			xml=xml+'expression="'+this.serviceExpression+'" ';
		}
		xml=xml+'>\n';
		xml=xml+this.getFieldsXML();
		xml=xml+'</activiti:executionListener>\n'
		return xml;
	}
});
/**
 * Process field object
 */
ESTDesigner.model.Field=ESTDesigner.model.BaseModel.extend({
	init:function(){
		this.id=draw2d.util.UUID.create();
		this.name=null;
		this.type=null;
		this.value=null;
	},
	toJSON:function(){
		var json = {
				id:this.id,
				name:this.name,
				type:this.type,
				value:this.value
		};
		return JSON.stringify(json);
	},
	toXML:function(){
		var xml = '<activiti:field name="'+this.name+'">\n';
		if(this.type=='string'){
			xml=xml+'<activiti:string>'+this.value+'</activiti:string>\n';
		}else if(this.type='expression'){
			xml=xml+'<activiti:expression>'+this.value+'</activiti:expression>\n';
		}
		xml=xml+'</activiti:field>\n';
	  	return xml
	}
});
//form porperties object
ESTDesigner.model.FormProperty=ESTDesigner.model.BaseModel.extend({
	init:function(){
		this.id=null;
		this.name=null;
		this.type=null;
		this.expression=null;
		this.variable=null;
		this.defaultValue=null;
		this.datePattern=null;
		this.readable=null;
		this.writeable=null;
		this.required=null;
		this.values=new draw2d.util.ArrayList();
	},
	getPropValuesXML:function(){
		var xml = "";
		for(var i=0;i<this.values.getSize();i++){
			var val = this.values.get(i);
			xml=xml+val.toXML();
		}
		return xml;
	},
	toXML:function(){
		var xml = '<activiti:formProperty id="'+this.id+'" name="'+this.name+'" ';
		if(this.type!=null){
			xml=xml+'type="'+this.type+'" ';
		}
		if(this.expression!=null&&this.expression!=''){
			xml=xml+'expression="'+this.expression+'" ';
		}
		if(this.variable!=null&&this.variable!=''){
			xml=xml+'variable="'+this.variable+'" ';
		}
		if(this.defaultValue!=null&&this.defaultValue!=''){
			xml=xml+'default="'+this.defaultValue+'" ';
		}
		if(this.datePattern!=null&&this.datePattern!=''){
			xml=xml+'datePattern="'+this.datePattern+'" ';
		}
		if(this.readable!=null&&this.readable!=''){
			xml=xml+'readable="'+this.readable+'" ';
		}
		if(this.writeable!=null&&this.writeable!=''){
			xml=xml+'writeable="'+this.writeable+'" ';
		}
		if(this.required!=null&&this.required!=''){
			xml=xml+'required="'+this.required+'" ';
		}
		xml=xml+'>\n';
		xml=xml+this.getPropValuesXML();
		xml=xml+'</activiti:formProperty>\n'
		return xml;
	},
	getFormValue:function(id){
		for(var i=0;i<this.values.getSize();i++ ){
			var v = this.values.get(i);
			if(v.id == id){
				return v;
			}
		}
	},
	deleteFormValue:function(id){
		var field = this.getFormValue(id);
		this.values.remove(field);
	},
	getValuesString:function(){
		var f = '';
		for(var i=0;i<this.values.getSize();i++){
			var v = this.values.get(i);
			f=f+v.id+":"+v.name+",";
		}
		return f;
	}
});
ESTDesigner.model.FormValue=ESTDesigner.model.BaseModel.extend({
	init:function(){
		this.id=null;
		this.name=null;
	},
	toXML:function(){
		var xml = '<activiti:value id="'+this.id+'" name="'+this.name+'"></activiti:value>\n';
	  return xml
	}
});
/**
 * Task listener object definition
 */
ESTDesigner.model.TaskListener=ESTDesigner.model.Listener.extend({
	init:function(){
		this._super();
	},
	toXML:function(){
		var xml = '<activiti:executionListener event="'+this.event+'" ';
		if(this.serviceType=='javaClass'){
			xml=xml+'class="'+this.serviceClass+'" ';
		}else if(this.serviceType=='expression'){
			xml=xml+'expression="'+this.serviceExpression+'" ';
		}
		xml=xml+'>\n';
		xml=xml+this.getFieldsXML();
		xml=xml+'</activiti:executionListener>\n'
		return xml;
	}
});
/**
 * Line listener object definition
 */
ESTDesigner.model.ConnectionListener=ESTDesigner.model.Listener.extend({
	init:function(){
		this._super();
	},
	toXML:function(){
		var xml = '<activiti:executionListener ';
		if(this.serviceType=='javaClass'){
			xml=xml+'class="'+this.serviceClass+'" ';
		}else if(this.serviceType=='expression'){
			xml=xml+'expression="'+this.serviceExpression+'" ';
		}
		xml=xml+'>\n';
		xml=xml+this.getFieldsXML();
		xml=xml+'</activiti:executionListener>\n'
		return xml;
	}
});

function formatXml(text)
{
    //去掉多余的空格
    text = '\n' + text.replace(/(<\w+)(\s.*?>)/g,function($0, name, props)
    {
        return name + ' ' + props.replace(/\s+(\w+=)/g," $1");
    }).replace(/>\s*?</g,">\n<");
    
    //把注释编码
    text = text.replace(/\n/g,'\r').replace(/<!--(.+?)-->/g,function($0, text)
    {
        var ret = '<!--' + escape(text) + '-->';
        //alert(ret);
        return ret;
    }).replace(/\r/g,'\n');
    
    //调整格式
    var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
    var nodeStack = [];
    var output = text.replace(rgx,function($0,all,name,isBegin,isCloseFull1,isCloseFull2 ,isFull1,isFull2){
        var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) || (isFull1 == '/') || (isFull2 == '/');
        //alert([all,isClosed].join('='));
        var prefix = '';
        if(isBegin == '!')
        {
            prefix = getPrefix(nodeStack.length);
        }
        else 
        {
            if(isBegin != '/')
            {
                prefix = getPrefix(nodeStack.length);
                if(!isClosed)
                {
                    nodeStack.push(name);
                }
            }
            else
            {
                nodeStack.pop();
                prefix = getPrefix(nodeStack.length);
            }

        
        }
            var ret =  '\n' + prefix + all;
            return ret;
    });
    
    var prefixSpace = -1;
    var outputText = output.substring(1);
    
    //把注释还原并解码，调格式
    outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g,function($0, prefix,  text)
    {
        //alert(['[',prefix,']=',prefix.length].join(''));
        if(prefix.charAt(0) == '\r')
            prefix = prefix.substring(1);
        text = unescape(text).replace(/\r/g,'\n');
        var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
        //alert(ret);
        return ret;
    });
    
    return outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
}

function getPrefix(prefixIndex)
{
    var span = '    ';
    var output = [];
    for(var i = 0 ; i < prefixIndex; ++i)
    {
        output.push(span);
    }
    
    return output.join('');
}