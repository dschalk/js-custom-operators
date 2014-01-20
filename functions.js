CodeMirror.commands.autocomplete = function(cm) {
    CodeMirror.showHint(cm, CodeMirror.hint.js);
};

$("textarea").each(function () {
    
    this.CodeMirror = CodeMirror.fromTextArea(this, {
        lineNumbers: true,
        matchBrackets: true,
        continueComments: "Enter",
        autoCloseBrackets: true,
        extraKeys: {
            "Ctrl-Q": "toggleComment",
            "Ctrl-Space": "autocomplete"
        }
    });
})


var $definedOperators = $(".defined-operators")
  , $jsCodeToRun      = $(".js-code")
  , $runButton        = $(".run")
  , $output           = $(".output");

/*
 *  This overrides the console.log function
 *
 * */
console.log = function () {
    var outputLine = "\n[log] ";
    for (var arg in arguments) {
        var cArg = arguments[arg];
        if (!cArg || typeof cArg === "number") {
            outputLine += cArg;
        } else {
            outputLine += JSON.stringify(cArg);
        }
        outputLine += " ";
    }
    var c = $output[0].CodeMirror;
    c.setValue(c.getValue() + outputLine);
};

function runCode () {
    // eval operators
    try {
        eval ($definedOperators[0].CodeMirror.getValue());
    } catch (e) {
        return $output.val(e.toString());
    }

    var result;
    // eval js code
    try {
        result = eval (evalThis($jsCodeToRun[0].CodeMirror.getValue()));
    } catch (e) {
        result = e.toString()
    }

    console.log(result || "");
}

$runButton.on("click", runCode);

function visitor(tree,visit){
    for(i in tree){
        visit(tree[i]);
        if(typeof tree[i] === "object" && tree[i] !== null){
            visitor(tree[i],visit);
        }
    }
}

function evalThis (input) {
    var syntax = esprima.parse(input);
    visitor(syntax,function(el){
        if(el.type === "BinaryExpression"){

            if (operators.available.indexOf(el.operator) !== -1){
                el.type = "CallExpression";
                el.callee = {
                    name: operators[el.operator].name,
                    type:"Identifier"
                };
                el.arguments = [el.left, el.right];
                delete el.operator;
                delete el.left;
                delete el.right;
            }
        }
    });

    scriptToEvaluate = escodegen.generate(syntax)
    return eval(scriptToEvaluate);
}
