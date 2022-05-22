<?php
enum FORMAT
{
    case NUMBER;
    case STRING;
    case DATE;
};

enum STATUS: string
{
    case FAIL = "FAIL";
    case SUCCESS = "SUCCESS";
};

class DB extends SQLite3
{
    private $itemPerPage = 100;
    private $dbPath = "./prisma/databases/dev.sqlite";

    function __construct()
    {
        $this->open($this->dbPath);
    }

    function GET($entity, $id, $page)
    {
        $returned = array();
        $i = 0;

        if ($id >= 0) {
            $result = $this->query("SELECT * FROM $entity WHERE id=$id limit 1");
            if (!$result) {
                $this->sendJSON(STATUS::SUCCESS->value, $returned);
            };
            while ($res = $result->fetchArray(SQLITE3_ASSOC)) {
                foreach ($res as $key => $value) {
                    $returned[$i][$key] = $value;
                }
                $i++;
            }
            $this->sendJSON(STATUS::SUCCESS->value, $returned);
            return;
        }

        if ($page >= 0) {
            $result = $this->query("SELECT * FROM $entity LIMIT " . $this->itemPerPage . " OFFSET " . ($this->itemPerPage * $page) . "");
            if (!$result) {
                $this->sendJSON(STATUS::SUCCESS->value, $returned);
            };
            while ($res = $result->fetchArray(SQLITE3_ASSOC)) {
                foreach ($res as $key => $value) {
                    $returned[$i][$key] = $value;
                }
                $i++;
            }
            $this->sendJSON(STATUS::SUCCESS->value, $returned);
            return;
        }

        $result = $this->query("SELECT * FROM $entity");
        if (!$result) {
            $this->sendJSON(STATUS::SUCCESS->value, $returned);
        };
        while ($res = $result->fetchArray(SQLITE3_ASSOC)) {
            foreach ($res as $key => $value) {
                $returned[$i][$key] = $value;
            }
            $i++;
        }

        $this->sendJSON(STATUS::SUCCESS->value, $returned);
        return;
    }


    function POST($entity, $objFormat, $objData)
    {
        if ($this->checkData($objFormat->check, $objData)) return;
        $sql = null;
        switch ($entity) {
            case 'user':
                $sql = "INSERT INTO user(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            case 'film':
                $sql = "INSERT INTO film(id,titre,description,authorId) values (null, '$objData->titre', '$objData->description', '$objData->authorId')";
                break;
            case 'author':
                $sql = "INSERT INTO author(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            case 'comment':
                $sql = "INSERT INTO comment(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            case 'fav':
                $sql = "INSERT INTO fav(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            case 'cinema':
                $sql = "INSERT INTO cinema(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            case 'seance':
                $sql = "INSERT INTO seance(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            case 'reservation':
                $sql = "INSERT INTO reservation(id,email,emailVerify,login,password,picture,birthday,csrfToken,bearerToken,bearerExpiration) values (null,'$objData->email',false,'$objData->login','$objData->password','','$objData->birthday','" . uniqid() . "','" . uniqid() . "','23/12/2033')";
                break;
            default:
                # code...
                break;
        }
        $result = $this->exec($sql);
        if (!$result) $this->sendJSONFail("Request failed");
    }

    function sendJSON($status, $data)
    {
        header('Content-Type: application/json; charset=utf-8');
        $obj = new stdClass();
        $obj->status = $status;
        $obj->data = $data;
        echo json_encode($obj);
    }

    function sendJSONFail($reason)
    {
        $obj = new stdClass();
        $obj->reason = $reason;
        $this->sendJSON(STATUS::FAIL->value, $obj);
    }

    function checkData($objFormat, $objData)
    {
        $failReason = null;
        foreach ($objFormat as $keyF => $valueF) {
            if ($valueF == FORMAT::NUMBER && (!isset($objData->{$keyF}) || !is_integer($objData->{$keyF}))) {
                $failReason = "Key '$keyF' should be an integer";
            }
            if ($valueF == FORMAT::STRING && (!isset($objData->{$keyF}) || !is_string($objData->{$keyF}))) {
                $failReason = "Key '$keyF' should be a string";
            }
            if ($valueF == FORMAT::DATE && (!isset($objData->{$keyF}) || !strtotime(trim($objData->{$keyF})))) {
                $failReason = "Key '$keyF' should be a valid Date";
            }
        }
        if ($failReason != null) {
            $this->sendJSONFail($failReason);
            return true;
        }
    }
}

$db = new DB();

$apiConf = new stdClass();
$apiConf->user = new stdClass();
$apiConf->user->check = new stdClass();
$apiConf->user->check->login = FORMAT::STRING;
$apiConf->user->check->password = FORMAT::STRING;
$apiConf->user->check->birthday = FORMAT::DATE;

$apiConf->film = new stdClass();
$apiConf->film->check = new stdClass();
$apiConf->film->POST = "";
$apiConf->film->check->titre = FORMAT::STRING;
$apiConf->film->check->description = FORMAT::STRING;
$apiConf->film->check->authorId = FORMAT::NUMBER;

$apiConf->author = new stdClass();
$apiConf->author->check = new stdClass();
$apiConf->author->POST = "";
$apiConf->author->check->name = FORMAT::STRING;

$apiConf->comment = new stdClass();
$apiConf->comment->check = new stdClass();
$apiConf->comment->POST = "";
$apiConf->comment->check->text = FORMAT::STRING;
$apiConf->comment->check->filmId = FORMAT::NUMBER;
$apiConf->comment->check->userId = FORMAT::NUMBER;

$apiConf->fav = new stdClass();
$apiConf->fav->check = new stdClass();
$apiConf->fav->POST = "";
$apiConf->fav->check->filmId = FORMAT::NUMBER;
$apiConf->fav->check->userId = FORMAT::NUMBER;

$apiConf->cinema = new stdClass();
$apiConf->cinema->check = new stdClass();
$apiConf->cinema->POST = "";
$apiConf->cinema->check->name = FORMAT::STRING;
$apiConf->cinema->check->coordX = FORMAT::NUMBER;
$apiConf->cinema->check->coordY = FORMAT::NUMBER;

$apiConf->seance = new stdClass();
$apiConf->seance->check = new stdClass();
$apiConf->seance->POST = "";
$apiConf->seance->check->id = FORMAT::STRING;
$apiConf->seance->check->filmId = FORMAT::NUMBER;
$apiConf->seance->check->cinemaId = FORMAT::NUMBER;
$apiConf->seance->check->date = FORMAT::DATE;

$apiConf->reservation = new stdClass();
$apiConf->reservation->check = new stdClass();
$apiConf->reservation->POST = "";
$apiConf->reservation->check->seanceId = FORMAT::NUMBER;
$apiConf->reservation->check->userId = FORMAT::NUMBER;

$link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
$link = explode("?", $link);
$link = explode("/", $link[0]);
if ($link[3] == "api") {
    if (!array_key_exists(4, $link)) {
        http_response_code(404);
        return;
    };
    foreach ($apiConf as $key => $value) {
        if ($key == $link[4]) {
            switch ($_SERVER['REQUEST_METHOD']) {
                case 'GET':
                    $db->GET($link[4], isset($_GET["id"]) ? $_GET["id"] : -1, isset($_GET["page"]) ? $_GET["page"] : -1);
                    break;
                case 'POST':
                    $data = json_decode(file_get_contents('php://input'));
                    $db->POST($link[4], $value, $data);
                    break;
                case 'UPDATE':
                    break;
                case 'DELETE':
                    break;
                default:
                    http_response_code(404);
                    break;
            }
        }
    }
} else {
    http_response_code(404);
}
