define([], function () {
    require([], function () {
    //绑定data-toggle=addresspicker属性点击事件
    $(document).on('click', "[data-toggle='addresspicker']", function () {
        var that = this;
        var callback = $(that).data('callback');
        var input_id = $(that).data("input-id") ? $(that).data("input-id") : "";
        var lat_id = $(that).data("lat-id") ? $(that).data("lat-id") : "";
        var lng_id = $(that).data("lng-id") ? $(that).data("lng-id") : "";
        var lat = lat_id ? $("#" + lat_id).val() : '';
        var lng = lng_id ? $("#" + lng_id).val() : '';
        var url = "/addons/address/index/select";
        url += (lat && lng) ? '?lat=' + lat + '&lng=' + lng : '';
        Fast.api.open(url, '位置选择', {
            callback: function (res) {
                input_id && $("#" + input_id).val(res.address);
                lat_id && $("#" + lat_id).val(res.lat);
                lng_id && $("#" + lng_id).val(res.lng);
                try {
                    //执行回调函数
                    if (typeof callback === 'function') {
                        callback.call(that, res);
                    }
                } catch (e) {

                }
            }
        });
    });
});

require.config({
    paths: {
        'webix': '../libs/webix/codebase/webix',
        'filemanager': '../libs/webix/codebase/filemanager',
    },
    shim: {
        "filemanager": {
            deps: ["webix"],
            exports: "filemanager"
        }
    }
});
//修改验证码为检验验证
require.config({
    paths: {
        'geet': '../addons/geet/js/gt'
    }
});
require(['geet'], function (Geet) {
    var geetInit = false;
    $("input[name='captcha']").each(function () {
        var obj = $(this);
        var form = obj.closest('form');
        $("<input type='hidden' name='geeturl' value='" + (form.attr("action") ? form.attr("action") : location.pathname + location.search) + "' />").appendTo(form);
        $("<input type='hidden' name='geetmodule' value='" + Config.modulename + "' />").appendTo(form);
        $("<input type='hidden' name='geetmoduleurl' value='" + Config.moduleurl + "' />").appendTo(form);
        form.attr('action', Fast.api.fixurl('/addons/geet/index/check'));
        obj.parent().removeClass('input-group').addClass('form-group').html('<div id="embed-captcha"><input type="hidden" name="captcha" class="form-control" data-rule="请完成验证码,验证码:required;" /> </div> <p id="wait" class="show">正在加载验证码......</p>');
        var handlerEmbed = function (captchaObj) {
            // 将验证码加到id为captcha的元素里，同时会有三个input的值：geetest_challenge, geetest_validate, geetest_seccode
            geetInit = captchaObj;
            captchaObj.appendTo("#embed-captcha");
            captchaObj.onReady(function () {
                $("#wait")[0].className = "hide";
            });
            captchaObj.onSuccess(function () {
                var result = captchaObj.getValidate();
                if (result) {
                    $('#embed-captcha input[name="captcha"]').val('ok');
                }
            });
            // 更多接口参考：http://www.geetest.com/install/sections/idx-client-sdk.html
        };
        Fast.api.ajax("/addons/geet/index/start", function (data) {
            // 更多配置参数请参见：http://www.geetest.com/install/sections/idx-client-sdk.html#config
            // 使用initGeetest接口
            // 参数1：配置参数
            // 参数2：回调，回调的第一个参数验证码对象，之后可以使用它做appendTo之类的事件
            initGeetest({
                gt: data.gt,
                challenge: data.challenge,
                new_captcha: data.new_captcha,
                product: "embed", // 产品形式，包括：float，embed，popup。注意只对PC版验证码有效
                width: '100%',
                offline: !data.success // 表示用户后台检测极验服务器是否宕机，一般不需要关注
            }, handlerEmbed);
            form.on("error.form", function (e, data) {
                geetInit.reset();
            });
            return false;
        });
    });
});
require.config({
    paths: {
        'bootstrap-markdown': '../addons/markdown/js/bootstrap-markdown.min',
        'hyperdown': '../addons/markdown/js/hyperdown.min',
        'pasteupload': '../addons/markdown/js/jquery.pasteupload'
    },
    shim: {
        'bootstrap-markdown': {
            deps: [
                'jquery',
                'css!../addons/markdown/css/bootstrap-markdown.css'
            ],
            exports: '$.fn.markdown'
        },
        'pasteupload': {
            deps: [
                'jquery',
            ],
            exports: '$.fn.pasteUploadImage'
        }
    }
});
require(['form', 'upload'], function (Form, Upload) {
    var _bindevent = Form.events.bindevent;
    Form.events.bindevent = function (form) {
        _bindevent.apply(this, [form]);
        try {
            if ($(".editor", form).size() > 0) {
                require(['bootstrap-markdown', 'hyperdown', 'pasteupload'], function (undefined, undefined, undefined) {
                    $.fn.markdown.messages.zh={Bold:"粗体",Italic:"斜体",Heading:"标题","URL/Link":"链接",Image:"图片",List:"列表","Unordered List":"无序列表","Ordered List":"有序列表",Code:"代码",Quote:"引用",Preview:"预览","strong text":"粗体","emphasized text":"强调","heading text":"标题","enter link description here":"输入链接说明","Insert Hyperlink":"URL地址","enter image description here":"输入图片说明","Insert Image Hyperlink":"图片URL地址","enter image title here":"在这里输入图片标题","list text here":"这里是列表文本","code text here":"这里输入代码","quote here":"这里输入引用文本"};
                    var parser = new HyperDown();
                    window.marked = function (text) {
                        return parser.makeHtml(text);
                    };
                    //粘贴上传图片
                    $.fn.pasteUploadImage.defaults = $.extend(true, $.fn.pasteUploadImage.defaults, {
                        fileName: "file",
                        appendMimetype: false,
                        ajaxOptions: {
                            url: Fast.api.fixurl(Config.upload.uploadurl),
                            beforeSend: function (jqXHR, settings) {
                                $.each(Config.upload.multipart, function(i,j ){
                                    settings.data.append(i, j);
                                });
                                return true;
                            }
                        },
                        success: function (data, filename, file) {
                            var ret = Upload.events.onUploadResponse(data);
                            $(this).insertToTextArea(filename, Config.upload.cdnurl + data.data.url);
                            return false;
                        },
                        error: function (data, filename, file) {
                            console.log(data, filename, file);
                        }
                    });
                    //手动选择上传图片
                    $(document).on("change", "#selectimage", function () {
                        $.each($(this)[0].files, function (i, file) {
                            $("").uploadFile(file, file.name);
                        });
                        //$("#message").pasteUploadImage();
                    });
                    $(".editor", form).each(function () {
                        $(this).markdown({
                            resize: 'vertical',
                            language: 'zh',
                            iconlibrary: 'fa',
                            autofocus: false,
                            savable: false
                        });
                        $(this).pasteUploadImage();
                    });
                });
            }
        } catch (e) {

        }

    };
});

require.config({
    paths: {
        'summernote': '../addons/summernote/lang/summernote-zh-CN.min'
    },
    shim:{
        'summernote': ['../addons/summernote/js/summernote.min', 'css!../addons/summernote/css/summernote.css'],
    }
});
require(['form', 'upload'], function (Form, Upload) {
    var _bindevent = Form.events.bindevent;
    Form.events.bindevent = function (form) {
        _bindevent.apply(this, [form]);
        try {
            //绑定summernote事件
            if ($(".summernote,.editor", form).size() > 0) {
                require(['summernote'], function () {
                    $(".summernote,.editor", form).summernote({
                        height: 250,
                        lang: 'zh-CN',
                        fontNames: [
                            'Arial', 'Arial Black', 'Serif', 'Sans', 'Courier',
                            'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande',
                            "Open Sans", "Hiragino Sans GB", "Microsoft YaHei",
                            '微软雅黑', '宋体', '黑体', '仿宋', '楷体', '幼圆',
                        ],
                        fontNamesIgnoreCheck: [
                            "Open Sans", "Microsoft YaHei",
                            '微软雅黑', '宋体', '黑体', '仿宋', '楷体', '幼圆'
                        ],
                        toolbar: [
                            ['style', ['style', 'undo', 'redo']],
                            ['font', ['bold', 'underline', 'strikethrough', 'clear']],
                            ['fontname', ['color', 'fontname', 'fontsize']],
                            ['para', ['ul', 'ol', 'paragraph', 'height']],
                            ['table', ['table', 'hr']],
                            ['insert', ['link', 'picture', 'video']],
                            ['view', ['fullscreen', 'codeview', 'help']]
                        ],
                        dialogsInBody: true,
                        callbacks: {
                            onChange: function (contents) {
                                $(this).val(contents);
                                $(this).trigger('change');
                            },
                            onInit: function () {
                            },
                            onImageUpload: function (files) {
                                var that = this;
                                //依次上传图片
                                for (var i = 0; i < files.length; i++) {
                                    Upload.api.send(files[i], function (data) {
                                        var url = Fast.api.cdnurl(data.url);
                                        $(that).summernote("insertImage", url, 'filename');
                                    });
                                }
                            }
                        }
                    });
                });
            }
        } catch (e) {

        }

    };
});

require.config({
    paths: {
        'tinymce': '../addons/tinymce/js/tinymce.min'
    },
});
require(['form', 'upload'], function (Form, Upload) {
    var _bindevent = Form.events.bindevent;
    Form.events.bindevent = function (form) {
        _bindevent.apply(this, [form]);
        try {
            //绑定summernote事件
            if ($(".tinymce,.editor", form).size() > 0) {
                require(['tinymce'], function () {
                    tinymce.init({
                        selector: ".tinymce,.editor",//容器可以是id也可以是class
                        language: 'zh_CN',//语言
                        //language: 'zh_CN',//语言
                        theme: 'modern',//主体默认主题
                        //width: 600,
                        // height: 250,
                        plugins: ['advlist link image lists charmap hr anchor pagebreak searchreplace wordcount visualblocks visualchars code insertdatetime nonbreaking save table contextmenu directionality help autolink autosave print preview spellchecker fullscreen media emoticons template paste textcolor'],//所含插件
                        //content_css: 'css/content.css',//设置样式
                        toolbar: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor emoticons | spellchecker help',//工具栏
                       //图像上传处理
                        convert_urls:false,//关闭url自动检测
                        images_upload_handler: function (blobInfo, success, failure) {
                            Upload.api.send(blobInfo.blob(), function (data) {
                                var url = Fast.api.cdnurl(data.url);
                                success( url);
                                return;
                            },function (data,ret) {
                                failure(ret.msg);
                                return;
                            });
                        },
                    //     contextmenu: false,
                        browser_spellcheck: true,//浏览器检查拼写
                        spellchecker_callback: function(method, text, success, failure) {
                            var words = text.match(this.getWordCharPattern());
                            if (method == "spellcheck") {
                                var suggestions = {};
                                for (var i = 0; i < words.length; i++) {
                                    suggestions[words[i]] = ["First", "Second"];
                                }
                                success(suggestions);
                            }
                        }
                    });
                    $(document).on("click", ":button[type=submit],input[type=submit]", function () {
                        tinymce.triggerSave();
                    });
                });
            }
        } catch (e) {

        }

    };
});

});