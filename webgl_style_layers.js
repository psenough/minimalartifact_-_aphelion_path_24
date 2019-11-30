var D = document;

var sync_stuff = false;

rand = function(n){
	return 0|(Math.random()*n);
};

D.title = 'Aphelion Path 24';

PI = Math.PI;
si = Math.sin;
M = Math.max;
N = Math.min;
Q = Math.sqrt;

var b = D.body;
var Ms = b.style;
Ms.margin='0px';
var blackcolor = Ms.background = "#000";
Ms.overflow = 'hidden';
var c = document.getElementById('c');

var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
//var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
//var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
var is_safari = navigator.userAgent.indexOf("Safari") > -1;
//var is_opera = navigator.userAgent.indexOf("Presto") > -1;
if ((is_chrome)&&(is_safari)) {is_safari=false;}


var gl = null;
gl = c.getContext('webgl', { alpha: false }) || c.getContext('experimental-webgl', { alpha: false });

gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);


var w = c.width = window.innerWidth;
var h = c.height = window.innerHeight;

gl.viewport(0, 0, w, h);

//
// request animation frame, from random place on the internet
//

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = M(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


var backgroundAudio;
var analyser;
var bufferLength;
var dataArray;
				
function initAudio( cb ) {
	var context;
	try {
		// Fix up for prefixing
		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		if (backgroundAudio != undefined) backgroundAudio.stop();
		context = new AudioContext();

		var request = new XMLHttpRequest();
		//if (is_safari) request.open('GET', 'esem_gre_ii.m4a', true);
		//	else request.open('GET', 'esem_gre_ii.ogg', true);		
		if (is_safari) request.open('GET', 'audio/psenough_191122.m4a', true);
			else request.open('GET', 'audio/psenough_191122.ogg', true);
		request.responseType = 'arraybuffer';
		console.log('requesting');

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
	  
				backgroundAudio = context.createBufferSource(); 	// creates a sound source
				backgroundAudio.buffer = buffer;                    // tell the source which sound to play
				backgroundAudio.connect(context.destination);       // connect the source to the context's destination (the speakers)
				backgroundAudio.loop = false;
				//backgroundAudio.start(0);
				
				analyser = context.createAnalyser();
				analyser.fftSize = 512;
				bufferLength = analyser.frequencyBinCount;
				dataArray = new Uint8Array(bufferLength);
				analyser.getByteTimeDomainData(dataArray);
				backgroundAudio.connect(analyser);
				/*analyser.connect(context.destination);*/
				
				// start canvas
				//drawCanvas();
	  
				console.log('decoded');

				cb();
	  
			}, function(evt) {
				console.log('failed to load buffer');
				console.log(evt);
			});
		}
		request.send();

	} catch(e) {
		console.log('Web Audio API is not supported in this browser');
		console.log(e);
		//drawCanvas();
	}
}

var textures = [];
var tcount = 0;

function checkLoad(){
	tcount++;
	//console.log('tcount: ' + tcount + ' ' + textures.length);
	if (tcount == textures.length) {
		initAudio( function(){
				let dom = document.getElementById('btn');
				if (dom) {
					dom.value = 'Start Demo!';
					dom.disabled = false;
				}
		});
	}
}

b.onload = function() {
	textures[0] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/722d6250471349ae715d3a1b9b09acbdfb4707fd.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[1] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/ca2dd7d1f0d751e260816314fd642f89049a3d8c.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[2] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/cd51b8ee5dede2bb9db8bc70de106f1b3778dd76.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[3] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/0624988c359a6491f9da2dc8ce4918d3d08c96d0.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[4] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/ad2e0d39958900267206e21ef157334e74e428c7.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[5] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/9cd1a90378d9a2647d50b974b5be67102e800851.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[6] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/8e63955d075985dcfc43faa626ad5703146dee49.jpg', function(ti){ console.log(ti); checkLoad(); });
	textures[7] = loadImageAndCreateTextureInfo('gfx/winter1_ddg/5b64264b09c6209ba44504732940866511805eaf.jpg', function(ti){ console.log(ti); checkLoad(); });
}


function start() {
	let dom = document.getElementById('starter_menu');
	if (dom) {//dom.parentNode.removeChild(dom);
		dom.style.display = "none";
	}

	resize();
	
	backgroundAudio.start(0, 0);
	init_time = (new Date()).getTime();
	drawCanvas();
}

var elem = D.createElement("div");
var S = elem.style;
S.background = "#fff";
S.position = "absolute";
S.height = "100px";
S.lineHeight = elem.style.height;
S.letterSpacing = "-3px";
S.textAlign = "center";
S.fontSize = "60px";
S.border = "solid #49b249";//"solid #fe9358";
S.borderWidth = "5px 0";
S.fontFamily = "Helvetica";
b.appendChild(elem);

let loop = undefined;

function drawCanvas() {
	
	let d = new Date();
	let n = d.getTime();
	
	let prevtime = n;

	shaderProgramQuad = initShaderProgramQuad();
	
	function drawBackground() {		
		//gl.bindFramebuffer( gl.FRAMEBUFFER, myBuffer.buffer );
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.bindFramebuffer( gl.FRAMEBUFFER, null );
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	}
	
	(loop = function() {
		if (loop != undefined) {
			//requestAnimationFrame(loop);
			
			let timer;
			if (skip == true) timer = skip_timer;
			 else timer = ((new Date()).getTime()-init_time);
			if (timer < playtime) {
				requestAnimationFrame( loop );
			} else {
				backToStartScreen();
			}
			if (sync_stuff == true) {
				let dom = document.getElementById('timer');
				if (dom) dom.innerText = timer;
				//console.log(timer);
			}
			
			//drawBackground();
			drawQuadOnScreen(timer);
			/*
			// global fader
			let fader = 0.0;
			// fadein
			fader = 1.0 - timer/playtime*10.0;
			if (timer > 5700) fader -= 0.5;
			if (fader < 0.0) fader = 0.0;
			// fadeout
			if (timer > playtime*0.9) fader = ((timer - playtime*0.9)/(playtime*0.1));*/
		}
	})();

}

// was going to be used for secret part, abandoned
document.onkeydown = checkKeycode;

function checkKeycode(e) {
	var keycode;
	if (window.event) keycode = window.event.keyCode;
		else if (e) keycode = e.which;
	//console.log(keycode);
	if (keycode == 83) {
		for (var j=0; j<16; j++) {
			spliceline(j);
		}
	}
}

var shaderProgramQuad;

var quadVerts = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
var myBuffer;
var floodfillBuffer;

var positionLocation;
var texcoordLocation;
var matrixLocation;
var positionBuffer;
var texcoordBuffer;
var textureLocation; // used seperately
var textureLocation1;
var textureLocation2;
var textureLocation3;
var textureLocation4;
var textureLocation5;
var textureLocation6;
var textureLocation7;
var textureLocation8;
var resolutionLocation;
var resolutionLocation2;
var timerLocation;
var audiodataLocation;

function initShaderProgramQuad() {

	var vertCode = `
		attribute vec2 a_position;
		attribute vec2 a_texCoord;
		uniform vec2 u_resolution;
		varying vec2 v_resolution;
		varying vec2 v_texCoord;
		void main() {
			vec2 zeroToOne = a_position;
			vec2 zeroToTwo = zeroToOne * 2.0;
			vec2 clipSpace = zeroToTwo - 1.0;
			gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
			//gl_Position = vec4(a_position[0], a_position[1], 0, 1);
			v_resolution = u_resolution;
			v_texCoord = a_texCoord;
		}`;

	var vertShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertShader, vertCode);
	gl.compileShader(vertShader);
	if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling vert shader!', gl.getShaderInfoLog(vertShader));
		return;
	}

	// original metaballs shader by iq
	var fragCode1 = `
		precision mediump float;
		uniform sampler2D u_texture1;
		uniform sampler2D u_texture2;
		uniform sampler2D u_texture3;
		uniform sampler2D u_texture4;
		uniform sampler2D u_texture5;
		uniform sampler2D u_texture6;
		uniform sampler2D u_texture7;
		uniform sampler2D u_texture8;
		varying vec2 v_resolution;
		varying vec2 v_texCoord;
		uniform float u_timer;
		float rand(vec2 co){
			return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
		}
		void main() {
			float iTime = u_timer*0.001;
			vec2 uv = vec2(v_texCoord.xy-0.5)*2.0;
		// anim
			vec2 c1 = vec2(0.8*sin( iTime*1.0 + vec2(4.0,0.5) + 1.0));
			vec2 c2 = vec2(0.8*sin( iTime*1.3 + vec2(1.0,2.0) + 2.0));
			vec2 c3 = vec2(0.8*sin( iTime*1.5 + vec2(0.0,2.0) + 4.0));
	
		// potential (3 metaballs)
			float v = 0.0;
			v += 1.0-smoothstep(0.0,0.6,length(uv-c1));
			v += 1.0-smoothstep(0.0,0.6,length(uv-c2));
			v += 1.0-smoothstep(0.0,0.6,length(uv-c3));
	
		// color	
			vec4 color0 = vec4(v,1.0,1.0,1.0);
		
		//vec4 color0 = vec4(v_texCoord.x);
		//vec4 color0 = mix(texture2D(u_texture1, v_texCoord), texture2D(u_texture2, v_texCoord),0.5);
		//color0 += texture2D(u_texture2, v_texCoord);

		/*if (color0.x < 0.1) { color0 = texture2D(u_texture1, v_texCoord); }
		else if (color0.x < 0.2) { color0 = texture2D(u_texture2, v_texCoord); }
		else if (color0.x < 0.3) { color0 = texture2D(u_texture3, v_texCoord); }
		else if (color0.x < 0.4) { color0 = texture2D(u_texture4, v_texCoord); }
		else if (color0.x < 0.5) { color0 = texture2D(u_texture5, v_texCoord); }
		else if (color0.x < 0.6) { color0 = texture2D(u_texture6, v_texCoord); }
		else if (color0.x < 0.7) { color0 = texture2D(u_texture7, v_texCoord); }
		else { color0 += texture2D(u_texture8, v_texCoord); }*/
		
		
		float shortest_dist = 0.0;
		float second_shortest_dist = 0.0;
		vec4 shortest_idx_v = vec4(0.0);
		vec4 second_shortest_idx_v = vec4(0.0);
		vec4 col[8];
		float dist[8];
		col[0] = texture2D(u_texture1, v_texCoord);
		col[1] = texture2D(u_texture2, v_texCoord);
		col[2] = texture2D(u_texture3, v_texCoord);
		col[3] = texture2D(u_texture4, v_texCoord);
		col[4] = texture2D(u_texture5, v_texCoord);
		col[5] = texture2D(u_texture6, v_texCoord);
		col[6] = texture2D(u_texture7, v_texCoord);
		col[7] = texture2D(u_texture8, v_texCoord);
		dist[0] = distance(color0,col[0]);
		dist[1] = distance(color0,col[1]);
		dist[2] = distance(color0,col[2]);
		dist[3] = distance(color0,col[3]);
		dist[4] = distance(color0,col[4]);
		dist[5] = distance(color0,col[5]);
		dist[6] = distance(color0,col[6]);
		dist[7] = distance(color0,col[7]);
		//for (int i=1; i<8; i++) {
		// manually unroll a for loop because webgl lol webgl
		float td = distance(color0,col[0]);
		shortest_dist = td;
		second_shortest_dist = td;
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[0];
			shortest_idx_v = col[0];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[0];
		}
		td = distance(color0,col[1]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[1];
			shortest_idx_v = col[1];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[1];
		}
		td = distance(color0,col[2]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[2];
			shortest_idx_v = col[2];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[2];
		}
		td = distance(color0,col[3]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[3];
			shortest_idx_v = col[3];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[3];
		}
		td = distance(color0,col[4]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[4];
			shortest_idx_v = col[4];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[4];
		}
		td = distance(color0,col[5]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[5];
			shortest_idx_v = col[5];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[5];
		}
		td = distance(color0,col[6]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[6];
			shortest_idx_v = col[6];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[6];
		}
		td = distance(color0,col[7]);
		if (td <= shortest_dist) {
			second_shortest_dist = shortest_dist;
			second_shortest_idx_v = col[7];
			shortest_idx_v = col[7];
		} else if (td <= second_shortest_dist) {
			second_shortest_dist = td;
			second_shortest_idx_v = col[7];
		}
		
		gl_FragColor = mix(shortest_idx_v, second_shortest_idx_v, 0.5);
		}`;
		
		
	// original cloud tunnel shader by nimitz https://www.shadertoy.com/view/3l23Rh
	var fragCode2 = `
		precision mediump float;
		uniform sampler2D u_texture1;
		uniform sampler2D u_texture2;
		uniform sampler2D u_texture3;
		uniform sampler2D u_texture4;
		uniform sampler2D u_texture5;
		uniform sampler2D u_texture6;
		uniform sampler2D u_texture7;
		uniform sampler2D u_texture8;
		varying vec2 v_resolution;
		varying vec2 v_texCoord;
		uniform float u_timer;
		uniform float u_audiodata[256];		
		
		mat2 rot(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}
		const mat3 m3 = mat3(0.33338, 0.56034, -0.71817, -0.87887, 0.32651, -0.15323, 0.15162, 0.69596, 0.61339)*1.93;
		float mag2(vec2 p){return dot(p,p);}
		float linstep(in float mn, in float mx, in float x){ return clamp((x - mn)/(mx - mn), 0., 1.); }
		float prm1 = 0.;
		vec2 bsMo = vec2(0.);

		vec2 disp(float t){ return vec2(sin(t*0.22)*1., cos(t*0.175)*1.)*2.; }

		vec2 map(vec3 p)
		{
			float iTime = u_timer*0.0004;
			vec3 p2 = p;
			p2.xy -= disp(p.z).xy;
			p.xy *= rot(sin(p.z+iTime)*(0.1 + prm1*0.05) + iTime*0.09);
			float cl = mag2(p2.xy);
			float d = 0.;
			p *= .61;
			float z = 1.;
			float trk = 1.;
			float dspAmp = 0.1 + prm1*0.2;
			for(int i = 0; i < 5; i++)
			{
				p += sin(p.zxy*0.75*trk + iTime*trk*.8)*dspAmp;
				d -= abs(dot(cos(p), sin(p.yzx))*z);
				z *= 0.57;
				trk *= 1.4;
				p = p*m3;
			}
			d = abs(d + prm1*3.)+ prm1*.3 - 2.5 + bsMo.y;
			return vec2(d + cl*.2 + 0.25, cl);
		}

		vec4 render( in vec3 ro, in vec3 rd, float time )
		{
			vec4 rez = vec4(0);
			const float ldst = 8.;
			vec3 lpos = vec3(disp(time + ldst)*0.5, time + ldst);
			float t = 1.5;
			float fogT = 0.;
			for(int i=0; i<130; i++)
			{
				if(rez.a > 0.99)break;

				vec3 pos = ro + t*rd;
				vec2 mpv = map(pos);
				float den = clamp(mpv.x-0.3,0.,1.)*1.12;
				float dn = clamp((mpv.x + 2.),0.,3.);
				
				vec4 col = vec4(0);
				if (mpv.x > 0.6)
				{
				
					col = vec4(sin(vec3(5.,0.4,0.2) + mpv.y*0.1 +sin(pos.z*0.4)*0.5 + 1.8)*0.5 + 0.5,0.08);
					col *= den*den*den;
					col.rgb *= linstep(4.,-2.5, mpv.x)*2.3;
					float dif =  clamp((den - map(pos+.8).x)/9., 0.001, 1. );
					dif += clamp((den - map(pos+.35).x)/2.5, 0.001, 1. );
					col.xyz *= den*(vec3(0.005,.045,.075) + 1.5*vec3(0.033,0.07,0.03)*dif);
				}
				
				float fogC = exp(t*0.2 - 2.2);
				col.rgba += vec4(0.06,0.11,0.11, 0.1)*clamp(fogC-fogT, 0., 1.);
				fogT = fogC;
				rez = rez + col*(1. - rez.a);
				t += clamp(0.5 - dn*dn*.05, 0.09, 0.3);
			}
			return clamp(rez, 0.0, 1.0);
		}

		float getsat(vec3 c)
		{
			float mi = min(min(c.x, c.y), c.z);
			float ma = max(max(c.x, c.y), c.z);
			return (ma - mi)/(ma+ 1e-7);
		}

		//from my "Will it blend" shader (https://www.shadertoy.com/view/lsdGzN)
		vec3 iLerp(in vec3 a, in vec3 b, in float x)
		{
			vec3 ic = mix(a, b, x) + vec3(1e-6,0.,0.);
			float sd = abs(getsat(ic) - mix(getsat(a), getsat(b), x));
			vec3 dir = normalize(vec3(2.*ic.x - ic.y - ic.z, 2.*ic.y - ic.x - ic.z, 2.*ic.z - ic.y - ic.x));
			float lgt = dot(vec3(1.0), ic);
			float ff = dot(dir, normalize(ic));
			ic += 1.5*dir*sd*ff*lgt;
			return clamp(ic,0.,1.);
		}

		void main()
		{	
			//vec2 q = fragCoord.xy/iResolution.xy;
			vec2 q = vec2(0.4); //v_texCoord.xy;/v_resolution.xy;
			//vec2 p = (gl_FragCoord.xy - 0.5*iResolution.xy)/iResolution.y;
			vec2 p = (v_texCoord.xy-0.5)/0.3;//(v_texCoord.xy - 0.5*v_resolution.xy)/v_resolution.y;
			//bsMo = (iMouse.xy - 0.5*iResolution.xy)/iResolution.y;
			
			float iTime = u_timer*0.0004;

			float time = iTime*3.;
			vec3 ro = vec3(0,0,time);
			
			ro += vec3(sin(iTime)*0.5,sin(iTime*1.)*0.,0);
				
			float dspAmp = .85;
			ro.xy += disp(ro.z)*dspAmp;
			float tgtDst = 3.5;
			
			vec3 target = normalize(ro - vec3(disp(time + tgtDst)*dspAmp, time + tgtDst));
			ro.x -= bsMo.x*2.;
			vec3 rightdir = normalize(cross(target, vec3(0,1,0)));
			vec3 updir = normalize(cross(rightdir, target));
			rightdir = normalize(cross(updir, target));
			vec3 rd=normalize((p.x*rightdir + p.y*updir)*1. - target);
			rd.xy *= rot(-disp(time + 3.5).x*0.2 + bsMo.x);
			prm1 = smoothstep(-0.4, 0.4,sin(iTime*0.3));
			vec4 scn = render(ro, rd, time);
				
			vec3 coll = scn.rgb;
			coll = iLerp(coll.bgr, coll.rgb, clamp(1.-prm1,0.05,1.));
			
			coll *= pow( 16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.12)*0.7+0.3; //Vign
			
			vec4 color0 = vec4(coll,1.0);
			
			
			float shortest_dist = 0.0;
			float second_shortest_dist = 0.0;
			vec4 shortest_idx_v = vec4(0.0);
			vec4 second_shortest_idx_v = vec4(0.0);
			vec4 col[8];
			float dist[8];
			col[0] = texture2D(u_texture1, v_texCoord);
			col[1] = texture2D(u_texture2, v_texCoord);
			col[2] = texture2D(u_texture3, v_texCoord);
			col[3] = texture2D(u_texture4, v_texCoord);
			col[4] = texture2D(u_texture5, v_texCoord);
			col[5] = texture2D(u_texture6, v_texCoord);
			col[6] = texture2D(u_texture7, v_texCoord);
			col[7] = texture2D(u_texture8, v_texCoord);
			dist[0] = distance(color0,col[0]);
			dist[1] = distance(color0,col[1]);
			dist[2] = distance(color0,col[2]);
			dist[3] = distance(color0,col[3]);
			dist[4] = distance(color0,col[4]);
			dist[5] = distance(color0,col[5]);
			dist[6] = distance(color0,col[6]);
			dist[7] = distance(color0,col[7]);
			//for (int i=1; i<8; i++) {
			// manually unroll a for loop because webgl lol webgl
			float td = distance(color0,col[0]);
			shortest_dist = td;
			second_shortest_dist = td;
			td = distance(color0,col[1]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[1];
				shortest_idx_v = col[1];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[1];
			}
			td = distance(color0,col[2]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[2];
				shortest_idx_v = col[2];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[2];
			}
			td = distance(color0,col[3]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[3];
				shortest_idx_v = col[3];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[3];
			}
			td = distance(color0,col[4]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[4];
				shortest_idx_v = col[4];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[4];
			}
			td = distance(color0,col[5]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[5];
				shortest_idx_v = col[5];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[5];
			}
			td = distance(color0,col[6]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[6];
				shortest_idx_v = col[6];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[6];
			}
			td = distance(color0,col[7]);
			if (td <= shortest_dist) {
				second_shortest_dist = shortest_dist;
				second_shortest_idx_v = col[7];
				shortest_idx_v = col[7];
			} else if (td <= second_shortest_dist) {
				second_shortest_dist = td;
				second_shortest_idx_v = col[7];
			}
			float a0 = clamp(u_audiodata[2]/256.0,0.0,1.0);
			float a1 = clamp(u_audiodata[10]/256.0,0.0,1.0);
			float a2 = clamp(u_audiodata[12]/256.0,0.0,1.0);
			float a3 = clamp(u_audiodata[14]/256.0,0.0,1.0);
			float a4 = clamp(u_audiodata[16]/256.0,0.0,1.0);
			float a5 = clamp(u_audiodata[18]/256.0,0.0,1.0);
			float a6 = clamp(u_audiodata[20]/256.0,0.0,1.0);
			float a7 = clamp(u_audiodata[56]/256.0,0.0,1.0);
			float a8 = clamp(u_audiodata[64]/256.0,0.0,1.0);
			float a9 = clamp(u_audiodata[80]/256.0,0.0,1.0);
			float a10 = clamp(u_audiodata[100]/256.0,0.0,1.0);
			float a11 = clamp(u_audiodata[110]/256.0,0.0,1.0);
			float a12 = clamp(u_audiodata[120]/256.0,0.0,1.0);
			float a13 = clamp(u_audiodata[130]/256.0,0.0,1.0);
			float a14 = clamp(u_audiodata[140]/256.0,0.0,1.0);
			float a15 = clamp(u_audiodata[150]/256.0,0.0,1.0);
			
			float div = 1.9;
			if (length(color0)/div < 0.53) { color0 += texture2D(u_texture1, v_texCoord)*a1; }
			else if (length(color0)/div < 0.58) { color0 += texture2D(u_texture2, v_texCoord)*a1*a10; }
			else if (length(color0)/div < 0.62) { color0 += texture2D(u_texture6, v_texCoord)*a5; }
			else if (length(color0)/div < 0.7) { color0 += texture2D(u_texture4, v_texCoord)*a5*a11; }
			else if (length(color0)/div < 0.75) { color0 += texture2D(u_texture7, v_texCoord)*a1; }
			else if (length(color0)/div < 0.8) { color0 += texture2D(u_texture3, v_texCoord)*a8; }
			else if (length(color0)/div < 0.85) { color0 += texture2D(u_texture5, v_texCoord)*a9; }
			else if (length(color0)/div < 0.9) { color0 += mix(texture2D(u_texture6, v_texCoord)*a10,shortest_idx_v*a11,0.5); }
			else if (length(color0)/div < 0.95) { color0 += texture2D(u_texture7, v_texCoord)*a12; }
			else { color0 += texture2D(u_texture8, v_texCoord)*a13; }
			
			float vign = 1.0-length(v_texCoord-0.5);
			//color0 = vec4(1.0-length(v_texCoord-0.5)); //color0*(a1*a2*a3*1.2+a15*a4)*(a0*1.2+a6*a10*0.9);
			color0 = clamp(color0,0.0,1.0);
			
			//float xa = u_audiodata[8]/256.0 + u_audiodata[16]/256.0 + u_audiodata[32]/256.0 + u_audiodata[64]/256.0 + u_audiodata[128]/256.0;
			//xa = xa/3.0;
			//xa = clamp(xa,0.0,1.0);
			
			float fadein = u_timer*0.00005;
			fadein = clamp(fadein,0.0,1.0);
			
			float fadeout = 1.0;
			if (u_timer > (10.*60.*1000.+51970.-18000.)) {
				fadeout = (u_timer-(10.*60.*1000.+51970.-18000.))/(18000.);
				fadeout = clamp(1.0-fadeout,0.0,1.0);
			}
			
			gl_FragColor = color0*vign*fadein*fadeout;
		}`;

	var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragShader, fragCode2);
	gl.compileShader(fragShader);
	if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
		console.log('ERROR compiling frag shader!', gl.getShaderInfoLog(fragShader));
		return;
	}

	var shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertShader);
	gl.attachShader(shaderProgram, fragShader);
	gl.linkProgram(shaderProgram);

	// look up where the vertex data needs to go.
	positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
	texcoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");

	// Create a buffer.
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Put a unit quad in the buffer
	var positions = [
	0, 0,
	0, 1,
	1, 0,
	1, 0,
	0, 1,
	1, 1]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Create a buffer for texture coords
	texcoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

	// Put texcoords in the buffer
	var texcoords = [
	0, 0,
	0, 1,
	1, 0,
	1, 0,
	0, 1,
	1, 1]
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

	resolutionLocation = gl.getUniformLocation(shaderProgram, "u_resolution");	
	resolutionLocation2 = gl.getUniformLocation(shaderProgram, "v_resolution");
	
	textureLocation1 = gl.getUniformLocation(shaderProgram, "u_texture1");
	textureLocation2 = gl.getUniformLocation(shaderProgram, "u_texture2");
	textureLocation3 = gl.getUniformLocation(shaderProgram, "u_texture3");
	textureLocation4 = gl.getUniformLocation(shaderProgram, "u_texture4");
	textureLocation5 = gl.getUniformLocation(shaderProgram, "u_texture5");
	textureLocation6 = gl.getUniformLocation(shaderProgram, "u_texture6");
	textureLocation7 = gl.getUniformLocation(shaderProgram, "u_texture7");
	textureLocation8 = gl.getUniformLocation(shaderProgram, "u_texture8");

	timerLocation = gl.getUniformLocation(shaderProgram, "u_timer");
	
	audiodataLocation = gl.getUniformLocation(shaderProgram, "u_audiodata");
	
	return shaderProgram;	 
}

function drawQuadOnScreen(timer) {
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, textures[0].texture);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, textures[1].texture);
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, textures[2].texture);
	gl.activeTexture(gl.TEXTURE3);
	gl.bindTexture(gl.TEXTURE_2D, textures[3].texture);
	gl.activeTexture(gl.TEXTURE4);
	gl.bindTexture(gl.TEXTURE_2D, textures[4].texture);
	gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, textures[5].texture);
	gl.activeTexture(gl.TEXTURE6);
	gl.bindTexture(gl.TEXTURE_2D, textures[6].texture);
	gl.activeTexture(gl.TEXTURE7);
	gl.bindTexture(gl.TEXTURE_2D, textures[7].texture);
	
	gl.useProgram(shaderProgramQuad);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);	
	gl.uniform2f(resolutionLocation2, gl.canvas.width, gl.canvas.height);	
	gl.uniform1i(textureLocation1, 0);
	gl.uniform1i(textureLocation2, 1);
	gl.uniform1i(textureLocation3, 2);
	gl.uniform1i(textureLocation4, 3);
	gl.uniform1i(textureLocation5, 4);
	gl.uniform1i(textureLocation6, 5);
	gl.uniform1i(textureLocation7, 6);
	gl.uniform1i(textureLocation8, 7);
	
	gl.uniform1f(timerLocation, timer);
	
	analyser.getByteTimeDomainData(dataArray);
	gl.uniform1fv(audiodataLocation, dataArray);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(url, cb) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
 
  // let's assume all images are not a power of 2
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 
  var textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
  };
  var img = new Image();
  //console.log('loading');
  img.addEventListener('load', function() {
	//console.log('load=?!');
    textureInfo.width = img.width;
    textureInfo.height = img.height;
 
    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	
	cb(textureInfo);
  });
  img.src = url;
 
  return textureInfo;
}


let playtime = 10*60*1000+51970;

window.onresize = resize;

function resize() {
	w = window.innerWidth;
	h = window.innerHeight;
	
	c.setAttribute("width", w);
	c.setAttribute("height", h);
	
	gl.viewport(0, 0, w, h);
	
	//ctx = c.getContext("2d");
	//ctx.width = w;
	//ctx.height = h;
}


document.addEventListener("keydown", keyDownTextField, false);

function keyDownTextField(e) {
	if (sync_stuff == false) return;
	var keyCode = e.keyCode;
	console.log(keyCode);

	switch(keyCode) {
		case 32: // space
			//init_time = (new Date()).getTime();
			if (skip == false) {
				enterSkip();
			} else {
				initAudio(function(){
						skip = false;
						init_time = (new Date()).getTime() - skip_timer;
						backgroundAudio.start(0, skip_timer/1000);
					});
			}
		break;
	}

}

function enterSkip() {
	skip_timer = (new Date()).getTime() - init_time;
	backgroundAudio.stop();
	backgroundAudio = undefined;
	skip = true;
}

var skip = false;
var skip_timer = 0;

window.addEventListener("wheel", function(e) {
	if (sync_stuff == false) return;
    //var dir = Math.sign(e.deltaY);
    //console.log(dir + ' ' + e.deltaY);
	if (skip == false) {
		enterSkip();
	}
	skip_timer += -e.deltaY;
	if (skip_timer < 0) skip_timer = 0;
});

function backToStartScreen(){
	let dom = document.getElementById('starter_menu');
	if (dom) {//dom.parentNode.removeChild(dom);
		dom.style.display = "block";
	}
	initAudio(function(){});
}
