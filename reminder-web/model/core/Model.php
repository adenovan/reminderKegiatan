
<?php 

Class Model extends PDO{

	private $stmt;
	private $sql;

	//used by join
	private $lastInsert = null;
	private $tablealias = array();
	private $alias = "AA";
	private $tablejoin;
	private $rowsjoin = array();
	private $typejoin = array();
	private $onjoin= array();
	private $wherejoin;
	private $groupbyjoin;
	private $orderbyjoin;
	private $limitjoin;
	private $offsetjoin;

	public function __construct(){
		$dsn = SITE_DB_DRIVER . ":host=". SITE_DB_HOST .";dbname=". SITE_DB;
		parent::__construct($dsn , SITE_DB_USERNAME , SITE_DB_PASSWORD);
		try
		{
			$this->setAttribute(PDO::ATTR_ERRMODE , PDO::ERRMODE_EXCEPTION);
		}
		catch (PDOException $pd)
		{
			$this->error422($pd->getMessage());
			die();
		}
	}

	protected function auditArray($var){
		$trace = debug_backtrace(false, 3);
		if(!is_array($var)){
			$error = "Not an array on class::".$trace[2]['class'].
			", function::".$trace[2]['function'].", Line ".$trace[1]['line'].
			" try to call ".$trace[1]['function']." with no array parameter ";
			$this->error($error);
		}
	}

	protected function auditLogin(){
		//if(isset($_SESSION["login"])){
			//loggedin
		//}else{
			//fuckoff
			//$this->error422("Anda belum login");
		//}
	}

	protected function auditSuper(){
		//if($_SESSION['hakakses']>0){
		//	$this->error422("Anda tidak memiliki akses");
		//}
	}

	protected function auditAkses(){
		//if($_SESSION['hakakses']>1){
		//		$this->error422("Anda tidak memiliki akses");
		//}
	}
	
	protected function auditAksesSenat(){
		//if($_SESSION['hakakses']>2){
		//$this->error422("Anda tidak memiliki akses");
		//}
	}

	protected function auditAksesBalma(){
		//if($_SESSION['hakakses']>3){
		//	$this->error422("Anda tidak memiliki akses");
		//}
	}
	protected function auditAksesPanitia(){
		//if($_SESSION['hakakses']>4){
		//	$this->error422("Anda tidak memiliki akses");
		//}
	}

	protected function dateTime($date){
		 $d = DateTime::createFromFormat('Y-m-d H:i:s', $date);
    	return $d && $d->format('Y-m-d H:i:s') == $date;
	}

	//select query
	protected function select($rows ="",$table="",$where= "",$limit="",$offset=""){
		if($rows!=""&&$table!=""){
			try{
				$this->sql = "SELECT ".$rows." FROM ".$table;
				$this->sql.= (!empty($where)) ? " WHERE ".$where : "";
				$this->sql.= (!empty($limit)) ? " LIMIT ".$limit : "";
				$this->sql.= (!empty($offset)) ? " OFFSET ".$offset :"";
				$this->stmt = $this->prepare($this->sql);
				$this->stmt->execute();
			}catch (PDOException $pd){
				return $this->error422($pd->getMessage());
			}
		}
	}

	//fetch select query
	protected function result($fetch ="all"){
		if(empty($this->stmt)){
			$this->error("no query found");
		}
		try{
			switch($fetch){
			case "all":
			return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
				break;
			case "one":
			return $this->stmt->fetch(PDO::FETCH_ASSOC);
				break;
			case "count":
			return $this->stmt->rowCount();
				break;
			}
		}catch (PDOException $pd){
			$this->error422($pd->getMessage());
		}
	}

	//insert data
	protected function insert($table="",$values=array(),$showResponse=true){
		if($table!=""&&!empty($values))
		{
			try{
			$formatval="";
			$i=0;
			foreach ($values as $value) {
				if(trim($value) === ""){
					if($showResponse){
					$this->error422("Data tidak lengkap");
					}
				}
				if($i==0){
					$formatval.="'".$value."'";
				}else{
					$formatval.=",'".$value."'";
				}
				$i++;
			}
			$this->sql = "INSERT INTO ".$table." VALUES(".$formatval.")";
			$stmt = $this->prepare($this->sql);
			$stmt->execute();
			$this->lastInsert = $this->lastInsertId();
			if($showResponse){
				$response = array("success"=>"Data ".$table." berhasil dimasukan");
				echo json_encode($response);
			}
			}catch (PDOException $pd){
				$this->error422($pd->getMessage());
			}
		}else{
			$this->error("Table".$table." or Values ".$values[0]." masih kosong");
		}
	}

	//update data
	protected function update($table = "",$columnset="",$where="",$success=""){
		if($table!=""&&$columnset!=""&&$where!=""){
			try{
			$this->sql = "UPDATE ".$table." SET ".$columnset." WHERE ".$where;
			$this->stmt = $this->prepare($this->sql);
			$this->stmt->execute();
			if($success!=""){
				$this->success($success);
			}else{
				$this->success("Data berhasil dirubah");
			}
			}catch (PDOException $pd){
				$this->error422($pd->getMessage());
			}
		}
	}

	protected function delete($table="",$pk="",$notif=true){
		if($table!=""&& $pk!=""){
			try{
			$this->sql = "DELETE FROM ".$table." WHERE ".$pk;
			$this->stmt = $this->prepare($this->sql);
			$this->stmt->execute();
				if($this->result("count") >0){
					if($notif){
					$this->success("Data ".$table." berhasil di hapus");
					}
				}else{
					if($notif){
					$this->error422("No data ".$table." deleted");
					}
				}
			}catch (PDOException $pd){
			return $this->error422($pd->getMessage());
			}
		}
	}

	//initiating join variable
	protected function preparejoin($rows=array(),$table=""){
		if(!empty($this->tablejoin)){
			$this->error("preparejoin already prepared on table ".$this->tablejoin);
		}
		$this->auditArray($rows);
		if(!empty($rows)&&!empty($table)){
			$this->tablealias[] = $this->alias;
			foreach ($rows as $value) {
				$this->rowsjoin[] = $this->alias.".".$value;
			}
			$this->tablejoin = $table." ".$this->alias;
		}else{
			$this->error("Empty rows : ".$rows.", Empty table :".$table);
		}
	}

	/*
		$on first array is field of preparejoin table
	*/
	protected function innerjoin($rows=array(),$table="",$on=array()){
		$this->auditArray($rows);
		$this->auditArray($on);
		if(!empty($this->rowsjoin)&&!empty($this->tablejoin)){
			if(!empty($rows)&&!empty($table)&&!empty($on)){
				$this->alias++;
				$this->tablealias[] = $this->alias;
				foreach ($rows as $value) {
				$this->rowsjoin[] = $this->alias.".".$value;
				}
				$this->typejoin[] = " INNER JOIN ".$table." ".$this->alias." ON AA.".$on[0]."=".$this->alias.".".$on[1];
			}else{
				$this->error("table , rows, or matching on field still empty");
			}
		}else{
			$this->error("no preparejoin found");
		}
	}

	protected function leftjoin($rows=array(),$table="",$on=array()){
		$this->auditArray($rows);
		$this->auditArray($on);
		if(!empty($this->rowsjoin)&&!empty($this->tablejoin)){
			if(!empty($rows)&&!empty($table)&&!empty($on)){
				$this->alias++;
				$this->tablealias[] = $this->alias;
				foreach ($rows as $value) {
				$this->rowsjoin[] = $this->alias.".".$value;
				}
				$this->typejoin[] = " LEFT OUTER JOIN ".$table." ".$this->alias." ON AA.".$on[0]."=".$this->alias.".".$on[1];
			}else{
				$this->error("table , rows, or matching on field still empty");
			}
		}else{
			$this->error("no preparejoin found");
		}
	}

	protected function joinwhere($where=array()){
		$this->auditArray($where);
		if(!empty($this->tablejoin)){
			if(is_numeric($where[0])){
				if(count($this->tablealias)>$where[0]){
				$this->wherejoin = " WHERE ".$this->tablealias[$where[0]].".".$where[1];
				}else{
				$this->error("No table match the index number : ".$where[0]);
				}
			}
			else if(in_array($where[0], $this->tablealias)){
				$this->wherejoin = " WHERE ".$where[0].".".$where[1];
			}else{
				$this->error("no table match the orderby");
			}
		}else{
			$this->error("no preparejoin found");
		}
	}

	protected function joinwhereraw($where){
		$this->wherejoin = $where;
	}
	
	protected function joingroupby($groupby=array()){
		$this->auditArray($groupby);
		if(!empty($this->tablejoin)){
			if(is_numeric($groupby[0])){
				if(count($this->tablealias)>$groupby[0]){
				$this->groupbyjoin = " GROUP BY ".$this->tablealias[$groupby[0]].".".$groupby[1];
				}else{
				$this->error("No table match the index number : ".$groupby[0] );
				}
			}
			else if(in_array($groupby[0], $this->tablealias)){
				$this->groupbyjoin = " GROUP BY ".$groupby[0].".".$groupby[1];
			}else{
				$this->error("no table match the groupby");
			}
		}else{
			$this->error("no preparejoin found");
		}
	}

	//call order by with array index or array values
	protected function joinorderby($orderby=array()){
		$this->auditArray($orderby);
		if(!empty($this->tablejoin)){
			if(is_numeric($orderby[0])){
				if(count($this->tablealias)>$orderby[0]){
				$this->orderbyjoin = " ORDER BY ".$this->tablealias[$orderby[0]].".".$orderby[1];
				}else{
				$this->error("No table match the index number : ".$orderby[0] );
				}
			}
			else if(in_array($orderby[0], $this->tablealias)){
				$this->orderbyjoin = " ORDER BY ".$orderby[0].".".$orderby[1];
			}else{
				$this->error("no table match the orderby");
			}
		}else{
			$this->error("no preparejoin found");
		}
	}

	protected function joinlimit($limit){
		if(is_numeric($limit)){
			$this->limitjoin = " LIMIT ".$limit;
		}else{
			$this->error("not numeric value on joinlimit value is ".$limit);
		}
	}

	protected function joinoffset($offset){
		if(is_numeric($offset)){
			$this->offsetjoin = " OFFSET ".$offset;
		}else{
			$this->error("not numeric value on joinoffset value is ".$offset);
		}
	}

	protected function joinsql(){
		if(empty($this->tablejoin) || empty($this->typejoin)){
			$this->error("no preparejoin or joinfunction called");
		}
		$sql = "SELECT ";
		foreach ($this->rowsjoin as $key => $value) {
			if($key===(count($this->rowsjoin)-1)){
				$sql.= $value;
			}
			else{
				$sql.= $value.",";
			}
		}
		$sql .= " FROM ".$this->tablejoin;
		foreach ($this->typejoin as $value) {
			$sql.= $value;
		}
		$sql .= (!empty($this->wherejoin)) ? $this->wherejoin : "";
		$sql .= (!empty($this->groupbyjoin)) ? $this->groupbyjoin : "";
		$sql .= (!empty($this->orderbyjoin)) ? $this->orderbyjoin : "";
		$sql .= (!empty($this->limitjoin)) ? $this->limitjoin :"";
		$sql .= (!empty($this->offsetjoin)) ? $this->offsetjoin :"";
		try{
			$this->stmt = $this->prepare($sql);
			$this->stmt->execute();
		}catch (PDOException $pd){
			$this->error422($pd->getMessage());
		}
	}

	protected function lastId(){
		if(!empty($this->lastInsert)){
		return $this->lastInsert;
		}
	}

	protected function success($args =""){
		echo json_encode(array('success' => $args));
	}

	//display error
	protected function error($args =""){
		echo json_encode(array('error' => $args));
		die();
	}


	protected function error403($args =""){
		http_response_code(403);
		echo json_encode(array('error' => $args));
		die();
	}

	protected function error404($args =""){
		http_response_code(404);
		echo json_encode(array('error' => $args));
		die();
	}

	protected function error422($args =""){
		http_response_code(422);
		echo json_encode(array('error' => $args));
		die();
	}

	//error jika method tidak sesuai dengan request
	protected function error405($child =""){
			http_response_code(405);
			echo json_encode(array('error' => $child.' Method not allowed'));
			die();
	}

	//error sql translated untuk client invoked by pdo errorcode
	protected function errorsql($code=""){

	}
}

?> 