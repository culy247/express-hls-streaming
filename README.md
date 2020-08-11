# express-hls-streaming
## 1. What is it?
<img src="./imgs/sample_1.jpg" width="100%"></img>
This project is a server side HLS streaming management tool using expressjs, a nodejs based framework.<br/>
Convert mp4 video to hls format using ffmpeg library.<br/><br/>

[Caution!]<br/>
This project is inappropriate for practical use.<br/>
It contains only very basic functions to convert mp4 files to hls standard, and the generated m3u8 also has only a single band.<br/>

In order to fully use this project, in-depth improvement of ffmpeg, development of a separate front-end project, and route for api must be developed separately.<br/>
The minimum data required for api development is included in the DB.<br/>

Please take this project as a basic design for converting and managing the original video in hls format on the web rather than for actual use.<br/><br/>
* * *
## 2. Basic concept for hls

hls stands for Http Live Streaming, a streaming protocol developed by Apple.<br/>
It consists of a .ts file that splits the original video into small pieces and an m3u8 file that contains meta information.<br/>
When loading m3u8 files in the stream playback player, only the parts (.ts) needed for playback are loaded instead of loading the entire file at once.<br/>
For more information, please refer to [this](https://d2.naver.com/helloworld/7122).</br><br/>
This is the hls streaming flow chart of the project.<br/>
<img src="./imgs/sample_2.jpg" width="60%"></img>

## 3. Git Repository Download
<pre><code>
git clone https://github.com/leekanghyo/express-hls-streaming.git
</pre></code>
* * *
## 4. Install required packages
[Version Info]
- nodejs: v12.16.1
- npm: v6.14.4
- express-generator: v4.16.1
- sequelize-cli: v5.5.1
- mysql: v8.0.19
<br/>

* * *

This project is based on nodejs, and the DB uses MySql.<br/>
If you have not installed nodejs and MySql, please install it first.<br/>
In this project, sequelize ORM is used to connect nodejs and MySql.<br/>
Install sequelize-cli to use sequelize commands.<br/>
<pre><code>
npm install
npm install --save-dev -g sequelize-cli
</pre></code>
<br/>
Now you need to migrate your database. Before that, change the Mysql access information to suit your development environment.<br/>
Database access information is managed in config/config.json.<br/>
<img src="./imgs/sample_17.jpg"/><br/>
If you have corrected the connection information, you should proceed with database migration.<br/>
<pre><code>
sequelize db:migrate
sequelize db:seed:all
</pre></code>
You are now ready to use your project.<br/>
Start the server with the following command.<br/>
<pre><code>
npm start
</pre></code>
Access information.<br/>

|addr|ID|PW|
|------|---|---|
|http://localhost:3000|admin|admin|

* * *
## 4. Project manual
<img src="./imgs/sample_1.jpg"></img>
This is the main page.</br>
On this page, you can check ffmpeg processing status, disk, memory, and CPU information.<br/>
* * *
In order to upload a video, you need to follow three steps.<br/>
- Step 1, Create category
- Step 2, Create Tag
- Step 3, Create video group
<br/>

* * *
<img src="./imgs/sample_3.jpg"></img><br/>

<img src="./imgs/sample_4.jpg"></img>
<br/>
First, create a category. When created, the list is updated.<br/>
[Used Group Count] increases when you create a video group and use the corresponding category.<br/><br/>

* * *
<img src="./imgs/sample_5.jpg" width="60%"></img><br/>
Add tags.<br/><br/>

* * *
<img src="./imgs/sample_6.jpg" width="60%"></img><br/>
You can now create video groups.<br/>
Click the Video Group and add new group buttons in order to move to the group creation page.<br/><br/>

<img src="./imgs/sample_7.jpg" width="60%"></img><br/><br/>
A video group consists of group title, thumbnail, category, and tag items.<br/>
Enter each item with an appropriate value.<br/><br/>
<img src="./imgs/sample_8.jpg" width="60%"></img></br><br/>
When the creation is successful, the list is updated.<br/>
Click the Video List button to go to the list page.<br/>

* * *
<img src="./imgs/sample_9.jpg" width="60%"></img><br/>
Click the Add New Video button to add a new video.<br/><br/>

* * *
<img src="./imgs/sample_10.jpg" width="60%"></img><br/>
Video requires title, subscript, path of original video, and date information.<br/>
The video path item is an input field. Enter the directory where the original video exists as an absolute path.<br/><br/>

* * *
<img src="./imgs/sample_11.jpg" width="60%"></img><br/><br/>
When video is added, it moves to the main screen, and the conversion progress status is shown in real time in the process log.<br/><br/>
When converting is complete, it is saved in the hls folder in the project.<br/><br/>
<img src="./imgs/sample_12.jpg"></img><br/><br/>

* * *
<img src="./imgs/sample_13.jpg" width="60%"></img><br/>
If converting is completed successfully, the list is updated.<br/>
Thumbnails automatically select and save frames corresponding to 10 seconds from the video.<br/><br/>
<img src="./imgs/sample_14.jpg" width="60%"></img><br/>
Click the Preview button to check the converted video.<br/><br/>
If you click the Copy hls Addr button, you can copy the stream url that you can check on the client side.<br/>
(If you change localhost to ip address in the copied address, you can check it in the external environment.)
<br/><br/>
<img src="./imgs/sample_15.jpg"></img><br/>
Paste the copied address to a player that can play m3u8, such as vlc player.<br/><br/>
<img src="./imgs/sample_16.jpg"></img><br/>
You can check that the streaming video plays normally.
