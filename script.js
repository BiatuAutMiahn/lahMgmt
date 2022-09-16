// https://stackoverflow.com/questions/563406/how-to-add-days-to-date
// Add Days to Date
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
// Subtract Days from Date
Date.prototype.subDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() - days);
    return date;
}
var now = new Date();
var tNow = now;
var tmpl;
var staff;
var docs;
var dynDom={}
var dpl=true;
var resolveGlobal;

// https://stackoverflow.com/questions/33289726/combination-of-async-function-await-settimeout
// Delay code for x millisec
var sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// https://stackoverflow.com/questions/17732897/difference-between-two-dates-in-years-months-days-in-javascript
// Custom Variant, Calc difference in date.
// xYxMxD (YearsMonthsDays)
var dateDiff = function(startingDate, endingDate) {
  let startDate = moment(startingDate);
  let endDate = moment(endingDate);
  let ret="-";
  if (startDate > endDate) {
    const swap = startDate;
    startDate = endDate;
    endDate = swap;
    ret="";
  }
  let duration = moment.duration(endDate.diff(startDate));
  if (duration.years()>0) {
    ret=ret+duration.years()+'Y';
  }
  if (duration.months()>0) {
    ret=ret+duration.months()+'M';
  }
  if (duration.days()>0) {
    ret=ret+duration.days()+'D';
  }
  if (duration.asDays()>0&&duration.asDays()<1){
    ret="Today";
  }
  return ret;
}

// https://stackoverflow.com/questions/2998784/how-to-output-numbers-with-leading-zeros-in-javascript
var pad=function(num, size) {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
}

// Format Date for Date Input fields.
var formatDate = function(date) {
  var ret="";
  if (date instanceof Date) {
    ret=date.getFullYear() + '-' + pad(date.getMonth() + 1,2) + '-' + pad(date.getDate(),2);
  }
  return ret;
}

// Adds document to Staff's document list.
var docAdd = function(doc){
  var docrow=$(`
      <tr id="row-staff-doc" class="align-middle drow">
        <td id="row-staff-doc-name" class="tblr-doc-name" scope="row"></td>
        <td class="tblr-doc-notes">
          <div class="input-group input-group-sm" style="background-color: #fff;border-radius: 4px;">
            <input id="row-staff-doc-notes" type="text" class="form-control docnote" aria-autocomplete="list"/>
            <button id="row-staff-doc-note-clear" type="button" class="btn btn-secondary docnoteclear" disabled>
              <span class="material-symbols-outlined">close</span>
            </button>
            <button id="row-staff-doc-note-edit" type="button" class="btn btn-secondary docnoteedit" disabled>
              <span class="material-symbols-outlined">edit_note</span>
            </button>
          </div>
        </td>
        <td class="tblr-doc-issued">
          <div class="input-group input-group-sm">
              <input id="row-staff-doc-issued" type="date" class="form-control docissdate" aria-autocomplete="list"/>
          </div>
        </td>
        <td id="row-staff-doc-dur" class="text-center tblr-doc-dur"></td>
        <td class="tblr-doc-expires">
          <div class="input-group input-group-sm">
              <input id="row-staff-doc-expires" type="date" class="form-control docexpdate" aria-autocomplete="list"/>
          </div>
        </td>
        <td id="row-staff-doc-eta" class="text-center docexpeta tblr-doc-eta"></td>
        <td class="tblr-doc-status">
          <select id="row-staff-doc-status" class="docstatussel form-select form-select-sm" aria-label=".form-select-sm example">
          <option value="-1" hidden></option>
          </select>
        </td>
        <td class="text-center tblr-doc-actions">
          <div class="btn-group btn-group-sm" role="group" style="background-color: #fff;border-radius: 4px;">
            <button type="button" class="btn btn-secondary docform" disabled>
              <span class="material-symbols-outlined">attach_file</span>
            </button>
            <button type="button" class="btn btn-primary docreset" disabled>
              <span class="material-symbols-outlined">settings_backup_restore</span>
            </button>
            <button type="button" class="btn btn-primary docsav" disabled>
              <span class="material-symbols-outlined">save</span>
            </button>
            <button type="button" class="btn btn-danger docdel">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </td>
      </tr>
  `);

  // Get Objects
  // var rsd=docrow.find("#row-staff-doc");
  var rsdna=docrow.find("#row-staff-doc-name");
  var rsds=docrow.find("#row-staff-doc-status");
  var rsdi=docrow.find("#row-staff-doc-issued");
  var rsde=docrow.find("#row-staff-doc-expires");
  var rsdd=docrow.find("#row-staff-doc-dur");
  var rsdt=docrow.find("#row-staff-doc-eta");
  var rsdn=docrow.find("#row-staff-doc-notes");
  var rsdnc=docrow.find("#row-staff-doc-note-clear");

  // Initialize Select
  $.each(tmpl['DocStatus'],function(i,v){
    rsds.append($('<option>', {
        value: i,
        text : v
    }));
  });

  // Set States
  if (doc.hasOwnProperty("Name")){
    rsdna.text(doc["Name"]);
  }
  if (doc.hasOwnProperty("Status")){
    if (doc['Status'] instanceof Array) {
      rsds.val("-1");
    } else {
      rsds.val(doc['Status']);
    }
  } else {
    rsds.val("-1");
  }

  if (doc.hasOwnProperty("StaffNote")){
    rsdn.val(doc['StaffNote']);
    if (doc['StaffNote']==""){
      rsdnc.prop("disabled", true);
    } else {
      rsdnc.prop("disabled", false);
    }
  }

  if (doc.hasOwnProperty("Issued")){
    rsdi.val(formatDate(doc['Issued']));
  }

  var noExp=false;
  if (doc.hasOwnProperty("NoExpiry")){
      noExp=doc["NoExpiry"];
  }

  if (doc.hasOwnProperty("Expires")){
    rsde.val(formatDate(doc['Expires']));
    if (doc['Expires'] instanceof Date) {
      rsdt.text(dateDiff(doc['Expires']));
    } else {
      rsdt.text('-');
    }
    if (!noExp&&doc['Expires']==0) {
      docrow.addClass('row-missdat');
      delete doc.RemainDays;
      rsdt.text('-');
    }
  } else {
    rsdt.text('-');
  }
  if (doc.hasOwnProperty("Duration")){
    rsdd.text(dateDiff(tNow.addDays(doc['Duration'])));
  } else {
    rsdd.text("-");
  }
  var isMandatory=true;
  if (doc.hasOwnProperty("Mandatory")){
      isMandatory=doc["Mandatory"];
  }
  if (!noExp&&doc.hasOwnProperty("RemainDays")){
    if (doc["RemainDays"]<=0) {
      docrow.addClass('row-alert');
    } else if (doc["RemainDays"]<=15) {
      docrow.addClass('row-warn30');
    } else if (doc["RemainDays"]<=30) {
      docrow.addClass('row-warn90');
    }
  }

  var rsds=docrow.find("#row-staff-doc-status");
  var rsdi=docrow.find("#row-staff-doc-issued");
  var rsde=docrow.find("#row-staff-doc-expires");
  var rsdn=docrow.find("#row-staff-doc-notes");
  var rsdnc=docrow.find("#row-staff-doc-note-clear");

  docrow.attr('data-docid',""+doc['id']);
  rsds.attr('data-initial',""+rsds.val());
  rsdi.attr('data-initial',""+rsdi.val());
  rsde.attr('data-initial',""+rsde.val());
  rsdn.attr('data-initial',""+rsdn.val());
  if (noExp) {
    rsde.prop("disabled", true);
    rsde.attr("type","text");
    rsde.val("Never");
    rsdt.text('-');
  }
  if(doc['Type']==0) {        //Training
    $('#doc-train-tbl').append(docrow);
  } else if(doc['Type']==2) { //Certification
    $('#doc-cert-tbl').append(docrow);
  } else if(doc['Type']==3) { // Licensing
    $('#doc-lic-tbl').append(docrow);
  } else  {                   // Other (Auto Insurance)
    $('#doc-other-tbl').append(docrow);
  }
}

// Load's Staff's Documents
var loadName = async function(){
  var docc=$('#doc-contain');
  var t=$(this);
  var i=t.data("sid");
  var s=staff[i];
  $('.name-tab').removeClass('active');
  t.addClass('active');
  if (dpl) {
    var dple=$("#doc-placeholder");
    var see=$('#staffedit');
    var sde=$('#staffdel');
    dple.css('opacity',0);
    dple.css('display','none');
    see.prop( "disabled", false );
    // sde.prop( "disabled", false );
  }
  if (docc.css('display') != 'none'){
    docc.css('opacity',0);
    docc.css('display','none');
  }
  $('#doc-cert-tbl').empty();
  $('#doc-lic-tbl').empty();
  $('#doc-train-tbl').empty();
  $('#doc-other-tbl').empty();

  $('#staffname').text(s['Name']['Last'] + ', ' + s['Name']['First']);
  procDocs(i);
  for (let j=0; j < s['DocExp'].length; j++) {
    $.each(s['DocExp'][j],function(k,v){
      if (k=='DB'){return};
      docAdd(v);
    });
  }
  // docc.css('display','block');
  docc.css('display','block');
  docc.css('opacity',1);
}

// Initialize Notification Dialog.
var dlgNotify = function(title, msg) {
    var dlg=$("#dlgNotify");
    $("#dlgTitle").html("Select Staff");
    $("#dlgText").html("You must select a staff member to delete.");
    $("#dlgNotify").modal("show");
}

// Check if field's value is initial (StaffAdd/StaffEdit)
var isInitialStaff = function(elem){
  var e=$(elem);
  var re=$('#dlgSave');
  var a=""+e.val().toString();
  var b=""+e.data('initial').toString();
  var dis;
  if (a!=b){
    dis=false;
  } else {
    dis=true;
  };
  re.prop( "disabled",dis);
  cmfStaffDlg();
}

// Reload Staff data from server.
var reloadData = async function(sel=null){
  $('#nametabs').empty();
  $('#nametabs-term').empty();
  await loadData();
  if (sel!=null){
    var e=$('#staff-'+sel);
    e.trigger('click');
    var lb=$('.staff-list');
    pos = e.position().top + (lb.scrollTop() - lb.position().top);
    lb.animate({
      scrollTop: pos
    }, 0);
    /* $('#nametabs').scrollTo('#staff-'+sel+' > .name-tab');
    $('#nametabs-term').scrollTo('#staff-'+sel+' > .name-tab'); */
  }
}

// Check if field's value is initial (DocumentRow)
var isInitialDoc = function(elem){
  var e=$(elem);
  var re=e.closest('.drow');
  var dsb=re.find('.docsav');
  var drb=re.find('.docreset');
  var a="";
  var b="";
  if (e.val()!="") {
    a=e.val();
  }
  if (e.data('initial')!="") {
    b=e.data('initial');
  }
  var dis;
  if (a!=b){
    dis=false;
  } else {
    dis=true;
  };
  dsb.prop( "disabled",dis);
  drb.prop( "disabled",dis);
}

// PreProcess Staff's Documents
var procDocs = function(idx){
  var worstDoc = 0;
  var newDocs = {};
  var tNow = new Date();
  var docExp=[[],[],[],[]];
  var isMandatory=true;
  var noExp=false;
  var missData=false;
  $.each(staff[idx]["Documents"],function(i,v){
    var doc=Object.assign(JSON.parse(JSON.stringify(docs[i])),v);
    doc['id']=i;
    noExp=false;
    if (doc.hasOwnProperty("NoExpiry")){
      noExp=doc["NoExpiry"];
    }
    if (doc.hasOwnProperty("Expires")){
      if (doc["Expires"] instanceof Date === false){
        doc["Expires"]=new Date(doc["Expires"]);
      }
      if (doc["Expires"].getTime()==0){
        doc["Expires"]=0
        if (!noExp) {
          missData=true;
        }
      };
      if (doc["Expires"] instanceof Date){
        doc["RemainDays"]=Math.floor((doc["Expires"].getTime()-tNow.getTime())/(24*3600*1000));
      }
    } else {
      if (!noExp) {
        missData=true;
      }
    };
    if (doc.hasOwnProperty("Issued")){
      if (doc["Issued"] instanceof Date === false){
        doc["Issued"]=new Date(doc["Issued"]);
      }
      if (doc["Issued"].getTime()==0){doc["Issued"]=0};
    };
    isMandatory=true;
    if (doc.hasOwnProperty("Mandatory")){
        isMandatory=doc["Mandatory"];
    }
    if (doc["RemainDays"]<=0) {
      docExp[0].push(doc)
      if (isMandatory&&worstDoc<3){
        worstDoc=3;
      }
    } else if (doc["RemainDays"]<=15) {
      docExp[1].push(doc)
      if (isMandatory&&worstDoc<2){
        worstDoc=2;
      }
    } else if (doc["RemainDays"]<=30) {
      docExp[2].push(doc)
      if (isMandatory&&worstDoc<1){
        worstDoc=1;
      }
    } else {
      docExp[3].push(doc)
    }
    newDocs[i]=doc;
  });
  staff[idx]['missData']=missData;
  var snt=$('#staff-'+idx);
  var nti=snt.find('.material-symbols-outlined');
  snt.removeClass('row-warn30 row-warn90 row-alert row-missdat');
  nti.text('check_circle');
  nti.attr('title',"");
  if (worstDoc) {
    nti.text('warning');
    nti.attr('title',"Documents Past Expiration");
  }
  if (missData){
      nti.text('rule');
      nti.attr('title',"Missing Data");
      snt.addClass('row-missdat');
  }
  if (staff[idx]['Status']!=3) {
    if (worstDoc==1) {
      snt.addClass('row-warn90');
      if (nti.text()=="warning"){
        nti.attr('title',"Documents Expire Within 30 Days");
      }
    } else if (worstDoc==2) {
      snt.addClass('row-warn30');
      if (nti.text()=="warning"){
        nti.attr('title',"Documents Expire Within 15 Days");
      }
    } else if (worstDoc==3) {
      snt.addClass('row-alert');
      if (nti.text()=="warning"){
        nti.attr('title',"Documents Past Expiration");
      }
    } else if (worstDoc==0){
      if (staff[idx]['missData']){
        snt.removeClass('row-warn30 row-warn90 row-alert row-missdat');
        snt.addClass('row-missdat');
      }
    }
  }
  staff[idx]["Documents"]=newDocs;
  staff[idx]["DocExp"]=docExp;
  staff[idx]["WorstDoc"]=worstDoc;
  if (staff[idx]['Status']==3) {
    nti.text("no_accounts");
  }
}

// Download Data from Server
var loadData = async function(){
  await jQuery.getJSON("tmpl.json").done(function(data){
      tmpl=data;
  });
  await jQuery.getJSON("docs.json").done(function(data){
      docs=data;
  });
  await jQuery.getJSON("staff.json").done(function(data){
      staff=data;
      var nsort=[];
      var ind=[];
      for (const x in data){
          if (x=='DB') { continue }
          nsort.push([x,(data[x]['Name']['Last']+data[x]['Name']['First']).toLowerCase()]);
      }
      nsort.sort((a, b) => a[1].localeCompare(b[1]));
      for (const x in nsort){
        ind.push(nsort[x][0]);
      }
      staff['DB']['idx']=ind;
  });
  var sidx=staff['DB']['idx']
  for (const si in sidx) {
    var i=sidx[si];
    var s=staff[i];
    var alias = s['Name']['Last'] + ', ' + s['Name']['First'];
    var status = s['Status'];
    var role = s['Role'];
    var station = s['Station'];
    // var tabelem= $(`
    //   <li class="nav-item" role="presentation" id="staff-`+i+`">
    //     <div data-sid="`+i+`" class="name-tab nav-link tab-clickable" style="margin: 8px 0 8px 8px;border-color: var(--bs-nav-tabs-link-hover-border-color);border: 2px solid #00000030;" role="tab" aria-selected="false"><span class="material-symbols-outlined">manage_accounts</span>`+alias+`</div>
    //   </li>
    // `);
    var tabelem= $(`
        <div style="/*width: 270px;*/border-color: var(--bs-nav-tabs-link-hover-border-color);border: 2px solid #00000030;" id="staff-`+i+`" data-sid="`+i+`" class="name-tab btn-sm btn-nopadding">
          <div style="" class="btn-padding btn-divider-right staff-status-icon"><span class="material-symbols-outlined" style="">check_circle</span></div>
          <span style="" class="btn-padding staff-label">`+alias+`</span>
        </div>
    `);
    if (status==3) {
      $('#nametabs-term').append(tabelem);
    } else {
      $('#nametabs').append(tabelem);
    }
    procDocs(i);
  };
  $('.name-tab').click(loadName);
  await $('.loading').css("display", "none");
};

// Checks if field is Empty
var cmfStaffDlg = function(e){
  var ie=$('#dlgSave');
  var sest=$('#se-stat');
  var sefn=$('#se-fn');
  var seln=$('#se-ln');
  var nos=false;
  if (sest.val()==""){
    nos=true;
  } else {
    sest.removeClass("form-field-error");
  }
  if (sefn.val()==""){
    nos=true;
  } else {
    sest.removeClass("form-field-error");
  }
  if (seln.val()==""){
    nos=true;
  } else {
    sest.removeClass("form-field-error");
  }
  if (nos) {
    ie.prop( "disabled",true);
  } else {
    ie.prop( "disabled",false);
  }
  return nos;
}

// Checks if field is Empty
var nsoEmpty = function(e){
  var ie=$('#dlgSave');
  if (e.val()==""){
    ie.prop( "disabled",true);
  } else {
    ie.prop( "disabled",false);
  }
}

// Calculate Tenure from Start-End\Today's Date
var calcTenure = function(){
  var sde=$('#se-sd');
  var ede=$('#se-ed');
  var etae=$('#se-ten');
  var sded;
  var eded;
  var eta="";
  if (sde.val()=="") {
    // console.log('sde',sde);
    eta="Select Start Date";
  } else {
    sded=new Date(sde.val().replace(/-/, '/'));
    // console.log('sded',sded);
    if (ede.val()==""){
      eta=dateDiff(tNow,sded);
    } else {
      // console.log('ede',ede);
      eded=new Date(ede.val().replace(/-/, '/'));
      // console.log('eded',eded);
      if (eded<=sded){
        eta="Start Date <= End Date";
      } else {
        eta=dateDiff(eded,sded);
      }
    }
  }
  // console.log('eta',eta);
  etae.val(eta);
}

// Initialize
$(document).ready(function(){
  loadData();
  $(document).on('change', '.docstatussel', function() {
    isInitialDoc(this);
  });
  $(document).on('change', '.docexpdate', function() {
    var e=$(this);
    var re=e.closest('.drow');
    var detae=re.find('.docexpeta');
    var eta=dateDiff(e.val());
    var tNow = new Date();
    var remains=Math.floor((new Date(e.val().replace(/-/, '/')).getTime()-tNow.getTime())/(24*3600*1000));
    detae.text(eta);
    isInitialDoc(this);
    // Update Doc Color
    re.removeClass('row-warn30 row-warn90 row-alert row-missdat');
    if (remains<=0) {
      re.addClass('row-alert');
    } else if (remains<=15) {
      re.addClass('row-warn30');
    } else if (remains<=30) {
      re.addClass('row-warn90');
    }
    if (e.val()==""){
      re.addClass('row-missdat');
    }
  });
  $(document).on('change', '.docissdate', function() {
    var e=$(this);
    var eta=dateDiff(e.val());
    var re=e.closest('.drow');
    var dede=re.find('.docexpdate');
    var did=parseInt(re.data('docid'));
    var nte=$('#nametabs');
    var pe=nte.find('.active');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');
    }
    var sid=parseInt(pe[0].id.replace('staff-',''));
    var doc=staff[sid]['Documents'][did];
    isInitialDoc(this);
    if (doc.hasOwnProperty("Duration")){
      var issd=new Date(e.val().replace(/-/, '/'));
      var exp=issd.addDays(doc['Duration']);
      console.log(issd,doc['Duration'],exp,formatDate(exp));
      dede.val(formatDate(exp)).trigger("change");
    }
  });
  $(document).on('keyup', '.docnote', function() {
    isInitialDoc(this);
    var e=$(this);
    var re=e.closest('.drow');
    var ie=re.find('.docnoteclear');
    if (e==""){
      ie.prop( "disabled",true);
    } else {
      ie.prop( "disabled",false);
    }
  });
  $(document).on('mouseup', '.docnoteclear', function() {
    var e=$(this);
    var re=e.closest('.drow');
    var ie=re.find('.docnote');
    ie.val("");
    e.prop("disabled",true);
    isInitialDoc(ie);
  });
  $(document).on('mouseup', '.docreset', function() {
    var e=$(this);
    var re=e.closest('.drow');
    var e=$(this);
    var re=e.closest('.drow');
    var dne=re.find('.docnote');
    var dede=re.find('.docexpdate');
    var dedei=dede.data('initial');
    var disd=re.find('.docissdate');
    var dsse=re.find('.docstatussel');
    var dsb=re.find('.docsav');
    var drb=re.find('.docreset');
    var detae=re.find('.docexpeta');
    var dncb=re.find('.docnoteclear');
    var eta
    if (dedei!=''){
      eta=dateDiff(dedei);
      detae.text(eta);
    }
    dne.val(dne.data('initial'));
    dede.val(dedei);
    disd.val(disd.data('initial'));
    dsse.val(dsse.data('initial'));
    if(dne.val()==''){
      dncb.prop( "disabled",true);
    } else {
      dncb.prop( "disabled",false);
    }
    dsb.prop( "disabled",true);
    drb.prop( "disabled",true);
  });
  $(document).on('mouseup', '.docdel', function() {
    var e=$(this);
    var re=e.closest('.drow');
    var dlg=$("#dlgDelete")
    var nte=$('#nametabs');
    var pe=nte.find('.active');//;//.closest('.nav-item');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');//;//.closest('.nav-item');
    }
    var sid=parseInt(pe[0].id.replace('staff-',''));
    $("#dlgTitle").html("Confirm Delete");
    $("#dlgText").html("Are you sure you want to delete this document?");
    promise = new Promise(function (resolve, reject) {
        var ask_about_flag = true;
        if (ask_about_flag) {
            dlg.modal("show");
            resolveGlobal = resolve;
        } else {
            resolve(null);
        }
    });
    promise.then(function (v) {
        dlg.modal("hide");
        if (v) {
          $.post("/",{ f: '5', p: JSON.stringify({id: sid, did: re.data("docid")}) },function(ret) {
            if (ret=="Success"||ret=="DocIdNotFound"){
              re.remove();
            }
          });
        }
    });
  });
  $(document).on('mouseup', '#staffadd', async function() {
    var nte=$('#nametabs');
    var pe=nte.find('.active');//.closest('.nav-item');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');//.closest('.nav-item');
    }
    var dple=$("#doc-placeholder");
    var dlg=$('#dlgStaffEdit');
    var sest=$('#se-stat');
    var sesd=$('#se-sd');
    var seed=$('#se-ed');
    var set=$('#se-ten');
    var sefn=$('#se-fn');
    var semn=$('#se-mn');
    var seln=$('#se-ln');
    var sedb=$('#se-dob');
    var sesn=$('#se-ssn');
    var sepn=$('#se-cpn');
    var seem=$('#se-eml');
    var seal1=$('#se-adl1');
    var seal2=$('#se-adl2');
    var seacty=$('#se-adcty');
    var seas=$('#se-ads');
    var seap=$('#se-adpc');
    var seac=$('#se-adc');
    var sen=$('#se-note');
    $("#dlgNotify").prop( "disabled",true);
    sest.val('');
    sefn.val('');
    semn.val('');
    seln.val('');
    sedb.val('');
    sesd.val('');
    seed.val('');
    sesn.val('');
    sepn.val('');
    seem.val('');
    seal1.val('');
    seal2.val('');
    seacty.val('');
    seas.val('');
    seap.val('');
    seac.val('United States');
    sen.val('');
    sest.attr('data-initial','');
    sefn.attr('data-initial','');
    semn.attr('data-initial','');
    seln.attr('data-initial','');
    sedb.attr('data-initial','');
    sesd.attr('data-initial','');
    seed.attr('data-initial','');
    sesn.attr('data-initial','');
    sepn.attr('data-initial','');
    seem.attr('data-initial','');
    seal1.attr('data-initial','');
    seal2.attr('data-initial','');
    seacty.attr('data-initial','');
    seas.attr('data-initial','');
    seap.attr('data-initial','');
    seac.attr('data-initial',seac.val());
    sen.attr('data-initial','');

    var selstatops="";
    for (var m in tmpl['UserStatus']) {
      selstatops+='<option value="'+m+'" ';
      if (m=="-1"){
        selstatops+='selected';
        selstatops+=' hidden';
      }
     selstatops+='>'+tmpl['UserStatus'][m]+'</option>';
    }
    sest.html(selstatops);

    promise = new Promise(function (resolve, reject) {
        var ask_about_flag = true;
        if (ask_about_flag) {
            $("#dlgStaffEditTitle").html("Add Staff");
            dlg.modal("show");
            resolveGlobal = resolve;
        } else {
            resolve(null);
        }
    });
    promise.then(function (v) {
        dlg.modal("hide");
        if (v) {
          var data={
            "Status": sest.val(),
            "StartDate": new Date(sesd.val().replace(/-/, '/')),
            "EndDate": new Date(seed.val().replace(/-/, '/')),
            "Name": {
              "First": sefn.val(),
              "Middle": semn.val(),
              "Last": seln.val(),
            },
            "DOB":new Date(sedb.val().replace(/-/, '/')),
            "SSN":sesn.val(),
            "Contact":{
              "Phone": {
                "Home": null,
                "Cell": sepn.val(),
                "Work": null,
                "Other": null
              },
              "Email": seem.val(),
              "Address1":seal1.val(),
              "Address2":seal2.val(),
              "City":seacty.val(),
              "State":seas.val(),
              "Zip":seap.val(),
              "Country":seac.val(),
            },
            "Notes":sen.val()
          }
          $.post("/",{ f: '2', p: JSON.stringify(data) }, async function(ret) {
            if (ret){
              reloadData(ret);
            }
          });
          // Populate Tab
          // Create Tab
        }
    });
  });
  $(document).on('mouseup', '#staffedit', function() {
    var nte=$('#nametabs');
    var pe=nte.find('.active');//.closest('.nav-item');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');//.closest('.nav-item');
    }
    var sid=parseInt(pe[0].id.replace('staff-',''));
    var s=staff[sid];
    var dple=$("#doc-placeholder");
    var dlg=$('#dlgStaffEdit');
    var sest=$('#se-stat');
    var sesd=$('#se-sd');
    var seed=$('#se-ed');
    var set=$('#se-ten');
    var sefn=$('#se-fn');
    var semn=$('#se-mn');
    var seln=$('#se-ln');
    var sedb=$('#se-dob');
    var sesn=$('#se-ssn');
    var sepn=$('#se-cpn');
    var seem=$('#se-eml');
    var seal1=$('#se-adl1');
    var seal2=$('#se-adl2');
    var seacty=$('#se-adcty');
    var seas=$('#se-ads');
    var seap=$('#se-adpc');
    var seac=$('#se-adc');
    var sen=$('#se-note');
    var snm=s['Name'];
    var sdb="";
    if (s.hasOwnProperty("DOB")){
      sdb=new Date(s["DOB"]);
      if (sdb.getTime()==0){
        sdb=''
      } else {
        sdb=formatDate(sdb);
      };
    }
    var ssd="";
    if (s.hasOwnProperty("StartDate")){
      ssd=new Date(s["StartDate"]);
      if (ssd.getTime()==0){
        ssd=''
      } else {
        ssd=formatDate(ssd);
      };

    }
    var sed="";
    if (s.hasOwnProperty("EndDate")){
      sed=new Date(s["EndDate"]);
      if (sed.getTime()==0){
        sed=''
      } else {
        sed=formatDate(sed);
      };
    }
    $("#dlgNotify").prop( "disabled",true);
    sefn.val(snm['First']);
    semn.val(snm['Middle']);
    seln.val(snm['Last']);
    sedb.val(sdb);
    sesd.val(ssd);
    seed.val(sed);
    sesn.val(s['SSN']);
    var sc;
    if (s.hasOwnProperty("Contact")){
      sc=s['Contact']
      if (sc.hasOwnProperty("Phone")){
        if (sc['Phone'].hasOwnProperty("Cell")){
          sepn.val(sc['Phone']['Cell']);
        }
      }
      seem.val(sc['Email']);
      seal1.val(sc['Address1']);
      seal2.val(sc['Address2']);
      seacty.val(sc['City']);
      seas.val(sc['State']);
      seap.val(sc['Zip']);
      seac.val(sc['Country']);
    }
    sen.val(s['Notes']);
    sefn.attr('data-initial',sefn.val());
    semn.attr('data-initial',semn.val());
    seln.attr('data-initial',seln.val());
    sedb.attr('data-initial',sedb.val());
    sesd.attr('data-initial',sesd.val());
    seed.attr('data-initial',seed.val());
    sesn.attr('data-initial',sesn.val());
    sepn.attr('data-initial',sepn.val());
    seem.attr('data-initial',seem.val());
    seal1.attr('data-initial',seal1.val());
    seal2.attr('data-initial',seal2.val());
    seacty.attr('data-initial',seacty.val());
    seas.attr('data-initial',seas.val());
    seap.attr('data-initial',seap.val());
    seac.attr('data-initial',seac.val());
    sen.attr('data-initial',sen.val());
    var status;
    if (s['Status'] instanceof Array) {
      status="";
    } else {
      status=s['Status'];
    }
    var selstatops="";
    var selstatinitial=-1;
    for (var m in tmpl['UserStatus']) {
      selstatops+='<option value="'+m+'" ';
      if (status==m||(status==""&&m=="-1")) {
        selstatinitial=m;
        selstatops+='selected';
      }
      if (m=="-1"){
        selstatops+=' hidden';
      }
     selstatops+='>'+tmpl['UserStatus'][m]+'</option>';
    }
    sest.html(selstatops);
    sest.attr('data-initial',selstatinitial);
    calcTenure();
    promise = new Promise(function (resolve, reject) {
        var ask_about_flag = true;
        if (ask_about_flag) {
            $("#dlgStaffEditTitle").html("Staff Edit");
            dlg.modal("show");
            resolveGlobal = resolve;
        } else {
            resolve(null);
        }
    });
    promise.then(function (v) {
        dlg.modal("hide");
        var data={
          "Status": sest.val(),
          "StartDate": new Date(sesd.val().replace(/-/, '/')),
          "EndDate": new Date(seed.val().replace(/-/, '/')),
          "Name": {
            "First": sefn.val(),
            "Middle": semn.val(),
            "Last": seln.val(),
          },
          "DOB":new Date(sedb.val().replace(/-/, '/')),
          "SSN":sesn.val(),
          "Contact":{
            "Phone": {
              "Home": null,
              "Cell": sepn.val(),
              "Work": null,
              "Other": null
            },
            "Email": seem.val(),
            "Address1":seal1.val(),
            "Address2":seal2.val(),
            "City":seacty.val(),
            "State":seas.val(),
            "Zip":seap.val(),
            "Country":seac.val(),
          },
          "Notes":sen.val()
        }
        $.post("/",{ f: '3', p: JSON.stringify({id: sid, v: data}) },function(ret) {
          reloadData(sid);
        });
    });
  });
  $(document).on('mouseup', '#staffdel', function() {
    var e=$(this);
    var nte=$('#nametabs');
    var pe=nte.find('.active');//.closest('.nav-item');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');//.closest('.nav-item');
    }
    var dlg=$("#dlgDelete")
    var dple=$("#doc-placeholder");
    var docc=$('#doc-contain');
    var see=$('#staffedit');
    var sde=$('#staffdel');
    var sid=parseInt(pe[0].id.replace('staff-',''));
    $("#dlgTitle").html("Confirm Delete");
    $("#dlgText").html("Are you sure you want to delete this member?");
    promise = new Promise(function (resolve, reject) {
        var ask_about_flag = true;
        if (ask_about_flag) {
            dlg.modal("show");
            resolveGlobal = resolve;
        } else {
            resolve(null);
        }
    });
    promise.then(function (v) {
        dlg.modal("hide");
        if (v) {
          // $.post("/",{ f: '4', p: JSON.stringify({id: sid}) },function(data) {
          //   if (data=="Success"){
          //     reloadData();
          //   }
          // });
        }
    });
  });
  $(document).on('mouseup', '#staffreload', function() {
    var nte=$('#nametabs');
    var pe=nte.find('.active');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');
      if (pe.length==0) {
        reloadData();
        return
      }
    }
    var sid=parseInt(pe[0].id.replace('staff-',''));
    reloadData(sid);

  });
  $(document).on('mouseup', '.docsav', function() {
    var e=$(this);
    var re=e.closest('.drow');
    var nte=$('#nametabs');
    var pe=nte.find('.active');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');
    }
    var nti=pe.find('.material-symbols-outlined');
    var nt=pe.find(".name-tab");
    var did=parseInt(re.data('docid'));
    var sid=parseInt(pe[0].id.replace('staff-',''));
    var dne=re.find('.docnote');
    var dede=re.find('.docexpdate');
    var disd=re.find('.docissdate');
    var dsse=re.find('.docstatussel');
    var dsb=re.find('.docsav');
    var drb=re.find('.docreset');
    var dncb=re.find('.docnoteclear');
    var tNow = new Date();
    var remains=Math.floor((new Date(dede.val().replace(/-/, '/')).getTime()-tNow.getTime())/(24*3600*1000));;
    var worstDoc;
    var isMandatory;
    var noExp;
    var missData;
    data={'Documents':{}};
    var ndi=disd.val();
    var nde=dede.val();
    console.log(nde);
    if (ndi!="") {
      ndi=new Date(ndi.replace(/-/, '/'));
    } else {
      ndi=0;
    }
    if (nde!="") {
      nde=new Date(nde.replace(/-/, '/'));
    } else {
      nde=0;
    }
    console.log(nde);

    doc={
        "Status": dsse.val(),
        "Issued": ndi,
        "Expires": nde,
        "Mandatory": true,
        "StaffNote": dne.val()
    };
    console.log(doc);
    data['Documents'][did]=doc;
    $.post("/",{ f: '3', p: JSON.stringify({id: sid, v: data}) },function(ret) {
      if (ret=="Success"){
        dne.data('initial',dne.val());
        dede.data('initial',dede.val());
        disd.data('initial',disd.val());
        dsse.data('initial',dsse.val());
        if(dne.val()==''){
          dncb.prop( "disabled",true);
        } else {
          dncb.prop( "disabled",false);
        }
        dsb.prop( "disabled",true);
        drb.prop( "disabled",true);
        staff[sid]['Documents'][did]=Object.assign({}, staff[sid]['Documents'][did], doc);
        procDocs(sid);
        // worstDoc=0;
        // $.each(staff[sid]["Documents"],function(i,v){
        //   noExp=false;
        //   if (doc.hasOwnProperty("NoExpiry")){
        //     noExp=doc["NoExpiry"];
        //   }
        //   isMandatory=true;
        //   if (doc.hasOwnProperty("Mandatory")){
        //       isMandatory=v["Mandatory"];
        //   }
        //   if (remains<=0) {
        //     if (worstDoc<3){
        //       if (isMandatory) worstDoc=3;
        //     }
        //   } else if (remains<=15) {
        //     if (worstDoc<2){
        //       if (isMandatory) worstDoc=2;
        //     }
        //   } else if (remains<=30) {
        //     if (worstDoc<1){
        //       if (isMandatory) worstDoc=1;
        //     }
        //   }
        // });
        // if (staff[sid]['Status']!=3) {
        //   console.log(pe,worstDoc);
        //   pe.removeClass('row-warn30 row-warn90 row-alert row-missdat');
        //   nti.text('check_circle');
        //   nti.attr('title',"");
        //   if (worstDoc) {
        //     nti.text('warning');
        //   }
        //   if (worstDoc==1) {
        //     pe.addClass('row-warn90');
        //     nti.attr('title',"Documents Expire Within 30 Days");
        //   } else if (worstDoc==2) {
        //     pe.addClass('row-warn30');
        //     nti.attr('title',"Documents Expire Within 15 Days");
        //   } else if (worstDoc==3) {
        //     pe.addClass('row-alert');
        //     nti.attr('title',"Documents Past Expiration");
        //   }
        //   if (dede.val()==""){
        //     pe.addClass('row-missdat');
        //     nti.text('rule');
        //     nti.attr('title',"Missing Data");
        //   }
        //   console.log(pe,worstDoc,remains);
        // }

      }
    });
  });
  $(document).on('mouseup', '#staffDocAdd', function() {
    var e=$(this);
    var nte=$('#nametabs');
    var pe=nte.find('.active');//.closest('.nav-item');
    if (pe.length==0) {
      nte=$('#nametabs-term');
      pe=nte.find('.active');//.closest('.nav-item');
    }
    var dlg=$("#dlgDocAdd")
    var sid=parseInt(pe[0].id.replace('staff-',''));
    var das=$('#docAddSel');
    das.empty();
    das.append($('<option>', {
        value: "-1",
        text : ""
    }));
    $.each(docs,function(i,v){
      if (i=='DB') { return }
      das.append($('<option>', {
          value: i,
          text : v['Name']
      }));
    });
    das.val("-1")
    promise = new Promise(function (resolve, reject) {
        var ask_about_flag = true;
        if (ask_about_flag) {
            dlg.modal("show");
            resolveGlobal = resolve;
        } else {
            resolve(null);
        }
    });
    promise.then(function (v) {
        dlg.modal("hide");
        if (v) {
          did=das.val();
          docAdd({'Name': docs[did]['Name'],'Type': docs[did]['Type'],'Mandatory': docs[did]['Mandatory'],'id': did});
        }
    });
  });
  $(document).on('change', '#se-stat', function() {
    isInitialStaff(this);
  });
  $(document).on('change', '#se-sd', function() {
    isInitialStaff(this);
    calcTenure();
    // isInitialDoc(this);
  });
  $(document).on('change', '#se-ed', function() {
    isInitialStaff(this);
    calcTenure();
    // isInitialDoc(this);
  });
  $(document).on('keyup', '#se-fn', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-mn', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-ln', function() {
    isInitialStaff(this);
  });
  $(document).on('change', '#se-dob', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-ssn', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-cpn', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-eml', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-adl1', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-adl2', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-adcty', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-ads', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-adpc', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-adc', function() {
    isInitialStaff(this);
  });
  $(document).on('keyup', '#se-note', function() {
    isInitialStaff(this);
  });
  $("#dlgDelete").click(function () {
    resolveGlobal(true);
  });
  $("#dlgCancel").click(function () {
    resolveGlobal(false);
  });
  $("#dlgSave").click(function () {
    if (cmfStaffDlg()){
      var sest=$('#se-stat');
      var sefn=$('#se-fn');
      var seln=$('#se-ln');
      if (sest.val()==""){
        sest.addClass("form-field-error");
      }
      if (sefn.val()==""){
        sefn.addClass("form-field-error");
      }
      if (seln.val()==""){
        seln.addClass("form-field-error");
      }
      return
    }
    resolveGlobal(true);
  });
  $("#dlgAdd").click(function () {
    resolveGlobal(true);
  });
  $(".collapsible").click(function () {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "contents") {
      content.style.display = "none";
      content.style.overflow = "hidden";
    } else {
      content.style.display = "contents";
      content.style.overflow = "visible";
    }
  });
});
