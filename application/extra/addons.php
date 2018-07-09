<?php

return array (
  'autoload' => false,
  'hooks' => 
  array (
    'sms_send' => 
    array (
      0 => 'alisms',
      1 => 'smsbao',
    ),
    'sms_notice' => 
    array (
      0 => 'alisms',
      1 => 'smsbao',
    ),
    'sms_check' => 
    array (
      0 => 'alisms',
      1 => 'smsbao',
    ),
    'addon_after_upgrade' => 
    array (
      0 => 'cms',
    ),
    'leesignhook' => 
    array (
      0 => 'leesign',
    ),
    'login_init' => 
    array (
      0 => 'loginbg',
    ),
    'testhook' => 
    array (
      0 => 'markdown',
    ),
    'upload_after' => 
    array (
      0 => 'thumb',
    ),
    'wipecache_after' => 
    array (
      0 => 'tinymce',
    ),
    'set_tinymce' => 
    array (
      0 => 'tinymce',
    ),
  ),
  'route' => 
  array (
    '/cms$' => 'cms/index/index',
    '/cms/c/[:diyname]' => 'cms/channel/index',
    '/cms/t/[:name]' => 'cms/tags/index',
    '/cms/a/[:diyname]' => 'cms/archives/index',
    '/cms/p/[:diyname]' => 'cms/page/index',
    '/cms/s' => 'cms/search/index',
    '/cms/wxapp' => 'cms/wxapp.index/index',
    '/leesign$' => 'leesign/index/index',
    '/qrcode$' => 'qrcode/index/index',
    '/qrcode/build$' => 'qrcode/index/build',
    '/third$' => 'third/index/index',
    '/third/connect/[:platform]' => 'third/index/connect',
    '/third/callback/[:platform]' => 'third/index/callback',
  ),
);