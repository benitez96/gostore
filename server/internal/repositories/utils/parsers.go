package utils

import (
	"database/sql"
	"strconv"

	"github.com/benitez96/gostore/internal/domain"
)


func ParseToSqlNullFloat64(n float64) sql.NullFloat64 {
	return sql.NullFloat64{ Float64: n, Valid: n != 0 }
}

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
