package utils

import (
	"database/sql"
	"strconv"

	"github.com/benitez96/gostore/internal/domain"
)


func ParseToSqlNullString(s string) sql.NullString {
	return sql.NullString{ String: s, Valid: s != "" }
}

func ParseToEmptyString(s sql.NullString) string {
	if s.Valid {
		return s.String
	}
	return ""
}

func ParseToInt64(idStr string) (int64, error) {
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return 0, domain.ErrIncorrectID
	}
	return id, nil
}
