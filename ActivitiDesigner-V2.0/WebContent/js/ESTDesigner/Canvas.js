ESTDesigner.Canvas=draw2d.Canvas.extend({
	init:function(attr){
		this.name = null;
		this.process= new ESTDesigner.model.Process();
		this._super(attr);
		this.installEditPolicy(new draw2d.policy.canvas.FadeoutDecorationPolicy());//鼠标移入编辑区连接点消失和显示效果
		this.installEditPolicy(new draw2d.policy.canvas.WheelZoomPolicy());//鼠标滚轮放大缩小效果
		this.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({//拖拽连接点划线效果
		    createConnection: createConnection
		}));
	},
	getXMLHeader:function(){
		var xml='<?xml version="1.0" encoding="UTF-8"?>\n';
		return xml;
	},
	getDefinitionsStartXML:function(){
		var xml = '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" '
			+'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
			+'xmlns:activiti="http://activiti.org/bpmn" '
			+'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" '
			+'xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" '
			+'xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" '
			+'typeLanguage="http://www.w3.org/2001/XMLSchema" '
			+'expressionLanguage="http://www.w3.org/1999/XPath" '
			+'targetNamespace="'+this.process.category+'">\n';
		return xml;
	},
	getDefinitionsEndXML:function(){
		var xml='</definitions>\n';
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
				default:
					break;
				}

			}, this),
			x : x,
			y : y,
			items : {
				"Properties" : {
					name : "Properties"
				}
			}
		});
	},
	toXML:function(){
		var xml = this.getXMLHeader();
		xml = xml+this.getDefinitionsStartXML();
		xml=xml+'<process id="'+this.process.id+'" name="'+this.process.name+'">\n';
		xml=xml+this.process.getDocumentationXML();
		xml=xml+this.process.getExtensionElementsXML();
		var bpmnDigramXml='<bpmndi:BPMNDiagram id="BPMNDiagram_'+this.process.id+'">\n'
		bpmnDigramXml=bpmnDigramXml+'<bpmndi:BPMNPlane bpmnElement="'+this.process.id+'" id="BPMNPlane_'+this.process.id+'">\n'
		var models = this.getFigures();
		for(var i=0;i<models.getSize();i++){
			var model=models.get(i);
			xml=xml+model.toXML();
			bpmnDigramXml=bpmnDigramXml+model.toBpmnDI();
		}
		var lines = this.getLines();
		for(var i=0;i<lines.getSize();i++){
			var line = lines.get(i);
			xml=xml+line.toXML();
			bpmnDigramXml=bpmnDigramXml+line.toBpmnDI();
		}
		xml=xml+'</process>\n';
		bpmnDigramXml=bpmnDigramXml+'</bpmndi:BPMNPlane>\n'
		bpmnDigramXml=bpmnDigramXml+'</bpmndi:BPMNDiagram>\n';
		xml=xml+bpmnDigramXml;
		xml=xml+this.getDefinitionsEndXML();
		xml=formatXml(xml);
		return xml;
	}
});
var createConnection=function(sourcePort, targetPort){

    var conn= new ESTDesigner.connection.Connection({
    	source:sourcePort,
        target:targetPort
        });

    // since version 3.5.6
    //
    conn.on("dragEnter", function(emitter, event){
        conn.attr({outlineColor:"#30ff30"});
    });
    conn.on("dragLeave", function(emitter, event){
        conn.attr({outlineColor:"#303030"});
    });

    return conn;

};