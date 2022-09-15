import tornado
import tornado.websocket
import tornado.ioloop
import tornado.web
import tornado.httpserver
import socket
import threading
import os
import time
import json
import collections.abc
import traceback
import sys

Magic = "7No4kAtbN0JEms6h"
Alias = "www"
node=None
logging=None
io_loop = None
www_app = None
thWWW = None
www_srv = None

def log_except_hook(et,ev,etb):
    text = "".join(traceback.format_exception(et,ev,etb))
    print(text)
    stampt=time.strftime('%H%M%S',time.localtime())
    stampd=time.strftime('%Y%m%d',time.localtime())
    buglog={}
    if os.path.isfile("debuglog.json"):
        with open("debuglog.json") as f:
            buglog=json.loads(f.read())
    if not stampd in buglog:
        buglog[stampd]={}
    buglog[stampd][stampt]=text
    with open("debuglog.json","w+") as f:
        f.write(json.dumps(buglog,indent=2))
        f.flush()
    print("An error has occurred and has been reported.")

def update(d, u):
    for k, v in u.items():
        if isinstance(v, collections.abc.Mapping):
            d[k] = update(d.get(k, {}), v)
        else:
            d[k] = v
    return d


class MainHandler(tornado.web.RequestHandler):
    def get(self,uri):
        #self.clear()
        #self.set_status(503)
        if uri is None or uri=="":
            with open('index.html','r') as f:
                self.write(f.read())
        else:
            if not os.path.exists(uri):
                self.clear()
                self.set_status(404)
                return
            if uri=="staff.json":
                while os.path.exists('staff.lock'):
                    time.sleep(1)
            with open(uri,'r') as f:
                self.write(f.read())
        return
    def post(self, uri):
        try:
            fn = int(self.get_argument('f'))
            p = json.loads(self.get_argument('p'))
            # methods
            # 1, nofi, Notifies clients that Databases have been modified and to reload.
            # 2, adid, Adds new identity. {'id': 0, ...} dict is validated, database is updated, notify is triggered. User adds documents via 'moid'
            # 4, rmid, Removes Identity {'id': 0}

            print("\n\n{fn:%s}\n{p:%s}"%(fn,p))
            while os.path.exists('staff.lock'):
                time.sleep(1)
            with open('staff.lock', 'w') as fp:
                pass
            staff={}
            with open('staff.json','r') as f:
                staff=json.loads(f.read())
            #with open('staff.old','w') as f:
            #    f.write(json.dumps(staff))
            if fn==2: # adid
                sid=str(max([int(x) for x in staff.keys() if not x=='DB'])+1)
                p['Documents']={}
                staff[sid]=p
                with open('staff.json','w') as f:
                    f.write(json.dumps(staff))
                self.write(sid)
                print('Success')
            elif fn==3: # moid
                sid=str(p['id'])
                s=staff[sid]
                print(sid)
                print(s)
                s=update(s,p['v'])
                print('')
                print(sid)
                print(s)
                staff[sid]=s
                with open('staff.json','w') as f:
                    f.write(json.dumps(staff,indent=2))
                self.write('Success')
                print('Success')
            elif fn==4: # rmid
                # sid=str(p['id'])
                # staff.pop(sid)
                # with open('staff.json','w') as f:
                #     f.write(json.dumps(staff))
                self.write('Disabled')
                # print('Success')
            elif fn==5: # rmdoc
                sid=str(p['id'])
                did=str(p['did'])
                s=staff[sid].copy()
                if not did in s['Documents']:
                    self.write('DocIdNotFound');
                    return
                s['Documents'].pop(did)
                staff[sid]=s
                with open('staff.json','w') as f:
                    f.write(json.dumps(staff))
                self.write('Success')
            else:
                self.write('Unknown Request')
            if os.path.exists('staff.lock'):
                os.remove("staff.lock")
        except Exception as e:
            et,ev,etb = sys.exc_info()
            log_except_hook(et,ev,etb)
            self.write("Failed")
            self.set_status(500);
        finally:
            if os.path.exists('staff.lock'):
                os.remove("staff.lock")

class EchoWebSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        self.write_message(u"You said: " + message)

    def on_close(self):
        print("WebSocket closed")

def make_wwwapp():
    return

def www_loop():
    global io_loop
    global www_loop
    global www_srv
    io_loop = tornado.ioloop.IOLoop().instance()
    #io_loop.make_current()
    www_srv.listen(18887)
    io_loop.start()

def kill():
    global io_loop
    global thWWW
    global www_app
    global www_srv
    www_srv.stop()
    ioloop = tornado.ioloop.IOLoop.instance()
    ioloop.add_callback(ioloop.stop)
    #if not thWWW is None:
    #    thWWW.join()
    io_loop=None
    www_app=None
    www_srv=None
    deadl=None
    thWWW=None

def __init__(n,l):
    global node
    global logging
    global io_loop
    global www_loop
    global www_app
    global thWWW
    global www_srv
    node=n
    logging=l
    node.id=Magic
    www_app = tornado.web.Application([
        (r"/(.*)", MainHandler),
    ])
    www_srv = tornado.httpserver.HTTPServer(www_app)
    thWWW = threading.Thread(target=www_loop)
    thWWW.daemon = True
    thWWW.start()
    logging.info("["+node.name+"]:\tInitialized")

def __reinit__(n):
    global io_loop
    io_loop.add_callback(kill)

def __deinit__():
    global io_loop
    io_loop.add_callback(kill)
